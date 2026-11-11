from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StudentRiskResult:
    attendance_risk_score: int
    academic_drop_score: int
    risk_level: str
    recommended_action: str


def compute_student_risk(
    absent_days: int,
    late_days: int,
    total_days: int,
    current_avg_grade: float | None,
    previous_avg_grade: float | None,
) -> StudentRiskResult:
    """Compute EWS attendance & academic drop scores (0-100) with actionable guidance."""
    effective_days = max(total_days, 1)
    absent_ratio = absent_days / effective_days
    late_ratio = late_days / effective_days

    attendance_score = min(100, int(round(absent_ratio * 180 + late_ratio * 45 + absent_days * 8)))

    drop_score = 0
    if current_avg_grade is not None:
        if current_avg_grade < 65:
            drop_score += int(round((70 - current_avg_grade) * 2.2))
        if previous_avg_grade is not None and previous_avg_grade > current_avg_grade:
            drop_score += int(round((previous_avg_grade - current_avg_grade) * 3.0))
    drop_score = max(0, min(100, drop_score))

    peak_risk = max(attendance_score, drop_score)
    if peak_risk >= 70 or (attendance_score >= 55 and drop_score >= 55):
        risk_level = "CRITICAL"
        action = "Jadwalkan konseling BK segera dan hubungi orang tua siswa."
    elif peak_risk >= 40:
        risk_level = "MEDIUM"
        action = "Lakukan pemantauan wali kelas dan beri bimbingan remedial."
    else:
        risk_level = "LOW"
        action = "Pertahankan pemantauan rutin."

    return StudentRiskResult(
        attendance_risk_score=attendance_score,
        academic_drop_score=drop_score,
        risk_level=risk_level,
        recommended_action=action,
    )
