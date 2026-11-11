from __future__ import annotations

import json
import uuid
from datetime import date, datetime, timezone
import psycopg
import redis
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from .auth import require_roles
from .config import settings
from .ews import compute_student_risk
from .scheduler import TeachingAssignment, solve_timetable

app = FastAPI(
    title="Smart School Intelligence & Scheduling Service (Service C)",
    version="1.0.0",
)


class AssignmentInput(BaseModel):
    classroom_id: str
    subject_id: str
    teacher_id: str
    weekly_hours: int = Field(ge=1, le=12)
    requires_lab: bool = False
    lab_room_code: str | None = None


class GenerateScheduleRequest(BaseModel):
    academic_period_id: str
    assignments: list[AssignmentInput]
    replace_existing: bool = True


def _get_redis() -> redis.Redis:
    return redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        password=settings.redis_password or None,
        decode_responses=True,
    )


def _publish_event(event_type: str, payload: dict) -> None:
    try:
        r = _get_redis()
        r.xadd(
            "stream:events",
            {
                "event_id": str(uuid.uuid4()),
                "event_type": event_type,
                "occurred_at": datetime.now(timezone.utc).isoformat(),
                "source": "python-ai",
                "payload": json.dumps(payload),
            },
            maxlen=100_000,
            approximate=True,
        )
    except Exception:
        pass


@app.get("/api/v1/ai/health")
def health():
    return {"status": "ok", "service": "ai-scheduling"}


@app.post("/api/v1/ai/schedules/generate")
def generate_schedule(
    req: GenerateScheduleRequest,
    _user: dict = Depends(require_roles(["WAKA_KURIKULUM", "SUPER_ADMIN"])),
):
    assignments = [
        TeachingAssignment(
            classroom_id=a.classroom_id,
            subject_id=a.subject_id,
            teacher_id=a.teacher_id,
            weekly_hours=a.weekly_hours,
            requires_lab=a.requires_lab,
            lab_room_code=a.lab_room_code,
        )
        for a in req.assignments
    ]

    try:
        lessons = solve_timetable(assignments)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    with psycopg.connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            if req.replace_existing:
                cur.execute(
                    "DELETE FROM academic_lms.schedules WHERE academic_period_id = %s",
                    (req.academic_period_id,),
                )
            for lesson in lessons:
                cur.execute(
                    """
                    INSERT INTO academic_lms.schedules
                      (academic_period_id, classroom_id, subject_id, teacher_id,
                       room_code, day_of_week, start_time, end_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        req.academic_period_id,
                        lesson.classroom_id,
                        lesson.subject_id,
                        lesson.teacher_id,
                        lesson.room_code,
                        lesson.day_of_week,
                        lesson.start_time,
                        lesson.end_time,
                    ),
                )
        conn.commit()

    _publish_event(
        "ScheduleGenerated",
        {
            "academicPeriodId": req.academic_period_id,
            "lessonCount": len(lessons),
        },
    )
    return {
        "academicPeriodId": req.academic_period_id,
        "scheduledLessons": len(lessons),
        "conflictCount": 0,
    }


@app.post("/api/v1/ai/ews/run")
def run_ews(
    _user: dict = Depends(require_roles(["KEPALA_SEKOLAH", "GURU_BK", "SUPER_ADMIN"])),
):
    today = date.today()
    alerts_raised = 0
    processed = 0

    with psycopg.connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT s.id,
                       COUNT(a.id) FILTER (WHERE a.status = 'ALPHA') AS absent_days,
                       COUNT(a.id) FILTER (WHERE a.status = 'LATE') AS late_days,
                       COUNT(a.id) AS total_days,
                       AVG(g.score) AS avg_score
                FROM iam_master.students s
                LEFT JOIN high_speed_ops.attendances a
                  ON a.user_id = s.user_id AND a.date >= CURRENT_DATE - INTERVAL '30 days'
                LEFT JOIN academic_lms.grades g ON g.student_id = s.id
                WHERE s.status = 'ACTIVE'
                GROUP BY s.id
                """
            )
            rows = cur.fetchall()

            for student_id, absent_days, late_days, total_days, avg_score in rows:
                risk = compute_student_risk(
                    absent_days=int(absent_days or 0),
                    late_days=int(late_days or 0),
                    total_days=int(total_days or 0),
                    current_avg_grade=float(avg_score) if avg_score is not None else None,
                    previous_avg_grade=None,
                )
                cur.execute(
                    """
                    INSERT INTO finance_analytics.ews_student_risk_scores
                      (student_id, calculated_date, attendance_risk_score,
                       academic_drop_score, risk_level, recommended_action)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (student_id, calculated_date) DO UPDATE
                    SET attendance_risk_score = EXCLUDED.attendance_risk_score,
                        academic_drop_score = EXCLUDED.academic_drop_score,
                        risk_level = EXCLUDED.risk_level,
                        recommended_action = EXCLUDED.recommended_action
                    """,
                    (
                        student_id,
                        today,
                        risk.attendance_risk_score,
                        risk.academic_drop_score,
                        risk.risk_level,
                        risk.recommended_action,
                    ),
                )
                processed += 1
                if risk.risk_level in ("MEDIUM", "CRITICAL"):
                    alerts_raised += 1
                    _publish_event(
                        "EwsAlertRaised",
                        {
                            "studentId": str(student_id),
                            "riskLevel": risk.risk_level,
                            "attendanceRiskScore": risk.attendance_risk_score,
                            "academicDropScore": risk.academic_drop_score,
                        },
                    )
        conn.commit()

    return {
        "calculatedDate": today.isoformat(),
        "studentsProcessed": processed,
        "alertsRaised": alerts_raised,
    }


@app.get("/api/v1/ai/ews/alerts")
def list_ews_alerts(
    _user: dict = Depends(require_roles(["KEPALA_SEKOLAH", "GURU_BK", "SUPER_ADMIN"])),
):
    with psycopg.connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT e.id, e.student_id, s.full_name, s.nis, e.calculated_date,
                       e.attendance_risk_score, e.academic_drop_score,
                       e.risk_level, e.recommended_action, e.is_resolved_by_bk
                FROM finance_analytics.ews_student_risk_scores e
                JOIN iam_master.students s ON s.id = e.student_id
                ORDER BY e.calculated_date DESC, e.attendance_risk_score DESC
                LIMIT 200
                """
            )
            cols = [d.name for d in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]
