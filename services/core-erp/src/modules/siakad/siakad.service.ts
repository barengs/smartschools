import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PgService } from '../../database/pg.service';
import { hashSecret } from '../iam/password.util';
import {
  CreateAcademicPeriodDto,
  CreateClassroomDto,
  CreateSubjectDto,
  CreateTeacherDto,
  UpdateStudentDto,
} from './dto/siakad.dto';

export interface AcademicPeriodRow {
  id: string;
  name: string;
  semester: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface SubjectRow {
  id: string;
  code: string;
  name: string;
  weekly_hours: number;
  requires_lab: boolean;
}

export interface ClassroomRow {
  id: string;
  academic_period_id: string;
  name: string;
  grade_level: number;
  homeroom_teacher_id: string | null;
  room_code: string | null;
  student_count?: string;
}

export interface StudentRow {
  id: string;
  user_id: string;
  nis: string | null;
  nisn: string | null;
  nik: string | null;
  full_name: string;
  gender: string | null;
  birth_date: string | null;
  status: string;
  dapodik_sync_id: string | null;
}

@Injectable()
export class SiakadService {
  constructor(private readonly pg: PgService) {}

  listPeriods() {
    return this.pg.query<AcademicPeriodRow>(
      `SELECT id, name, semester, start_date, end_date, is_active
       FROM academic_lms.academic_periods
       ORDER BY start_date DESC`,
    );
  }

  async createPeriod(dto: CreateAcademicPeriodDto) {
    return this.pg.withTransaction(async (client) => {
      if (dto.isActive) {
        await client.query('UPDATE academic_lms.academic_periods SET is_active = FALSE');
      }
      const res = await client.query<AcademicPeriodRow>(
        `INSERT INTO academic_lms.academic_periods
           (name, semester, start_date, end_date, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, semester, start_date, end_date, is_active`,
        [dto.name.trim(), dto.semester, dto.startDate, dto.endDate, dto.isActive ?? false],
      );
      return res.rows[0];
    });
  }

  async activatePeriod(periodId: string) {
    return this.pg.withTransaction(async (client) => {
      await client.query('UPDATE academic_lms.academic_periods SET is_active = FALSE');
      const res = await client.query<AcademicPeriodRow>(
        `UPDATE academic_lms.academic_periods
         SET is_active = TRUE
         WHERE id = $1
         RETURNING id, name, semester, start_date, end_date, is_active`,
        [periodId],
      );
      if (res.rows.length === 0) {
        throw new NotFoundException('Academic period not found');
      }
      return res.rows[0];
    });
  }

  listSubjects() {
    return this.pg.query<SubjectRow>(
      `SELECT id, code, name, weekly_hours, requires_lab
       FROM academic_lms.subjects
       ORDER BY name ASC`,
    );
  }

  async createSubject(dto: CreateSubjectDto) {
    try {
      return await this.pg.queryOne<SubjectRow>(
        `INSERT INTO academic_lms.subjects (code, name, weekly_hours, requires_lab)
         VALUES ($1, $2, $3, $4)
         RETURNING id, code, name, weekly_hours, requires_lab`,
        [dto.code.trim().toUpperCase(), dto.name.trim(), dto.weeklyHours ?? 2, dto.requiresLab ?? false],
      );
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new ConflictException('Subject code already exists');
      }
      throw err;
    }
  }

  listClassrooms(academicPeriodId?: string) {
    const params: unknown[] = [];
    let where = '';
    if (academicPeriodId) {
      params.push(academicPeriodId);
      where = 'WHERE c.academic_period_id = $1';
    }
    return this.pg.query<ClassroomRow>(
      `SELECT c.id, c.academic_period_id, c.name, c.grade_level,
              c.homeroom_teacher_id, c.room_code,
              COUNT(cm.student_id) AS student_count
       FROM academic_lms.classrooms c
       LEFT JOIN academic_lms.classroom_members cm ON cm.classroom_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.grade_level ASC, c.name ASC`,
      params,
    );
  }

  async createClassroom(dto: CreateClassroomDto) {
    try {
      return await this.pg.queryOne<ClassroomRow>(
        `INSERT INTO academic_lms.classrooms
           (academic_period_id, name, grade_level, homeroom_teacher_id, room_code)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, academic_period_id, name, grade_level, homeroom_teacher_id, room_code`,
        [
          dto.academicPeriodId,
          dto.name.trim(),
          dto.gradeLevel,
          dto.homeroomTeacherId ?? null,
          dto.roomCode ?? null,
        ],
      );
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new ConflictException('Classroom name already exists in this period');
      }
      throw err;
    }
  }

  async assignClassroomMembers(classroomId: string, studentIds: string[]) {
    return this.pg.withTransaction(async (client) => {
      for (const studentId of studentIds) {
        await client.query(
          `INSERT INTO academic_lms.classroom_members (classroom_id, student_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [classroomId, studentId],
        );
      }
      return { classroomId, assignedCount: studentIds.length };
    });
  }

  listClassroomStudents(classroomId: string) {
    return this.pg.query<StudentRow>(
      `SELECT s.id, s.user_id, s.nis, s.nisn, s.nik, s.full_name,
              s.gender, s.birth_date, s.status, s.dapodik_sync_id
       FROM academic_lms.classroom_members cm
       JOIN iam_master.students s ON s.id = cm.student_id
       WHERE cm.classroom_id = $1
       ORDER BY s.full_name ASC`,
      [classroomId],
    );
  }

  listStudents(status?: string, search?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }
    if (search?.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(
        `(s.full_name ILIKE $${params.length} OR s.nis ILIKE $${params.length} OR s.nisn ILIKE $${params.length})`,
      );
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.pg.query<StudentRow>(
      `SELECT s.id, s.user_id, s.nis, s.nisn, s.nik, s.full_name,
              s.gender, s.birth_date, s.status, s.dapodik_sync_id
       FROM iam_master.students s
       ${where}
       ORDER BY s.full_name ASC
       LIMIT 300`,
      params,
    );
  }

  async updateStudent(studentId: string, dto: UpdateStudentDto) {
    const existing = await this.pg.queryOne<StudentRow>(
      'SELECT id FROM iam_master.students WHERE id = $1',
      [studentId],
    );
    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    return this.pg.queryOne<StudentRow>(
      `UPDATE iam_master.students
       SET nis = COALESCE($2, nis),
           nisn = COALESCE($3, nisn),
           nik = COALESCE($4, nik),
           full_name = COALESCE($5, full_name),
           status = COALESCE($6, status),
           dapodik_sync_id = COALESCE($7, dapodik_sync_id),
           blood_type = COALESCE($8, blood_type),
           allergy_notes = COALESCE($9, allergy_notes)
       WHERE id = $1
       RETURNING id, user_id, nis, nisn, nik, full_name, gender, birth_date, status, dapodik_sync_id`,
      [
        studentId,
        dto.nis ?? null,
        dto.nisn ?? null,
        dto.nik ?? null,
        dto.fullName ?? null,
        dto.status ?? null,
        dto.dapodikSyncId ?? null,
        dto.bloodType ?? null,
        dto.allergyNotes ?? null,
      ],
    );
  }

  async exportDapodikReady() {
    const rows = await this.pg.query(
      `SELECT s.nis, s.nisn, s.nik, s.full_name, s.gender, s.birth_date,
              s.status, s.dapodik_sync_id,
              c.name AS classroom_name, c.grade_level
       FROM iam_master.students s
       LEFT JOIN academic_lms.classroom_members cm ON cm.student_id = s.id
       LEFT JOIN academic_lms.classrooms c ON c.id = cm.classroom_id
       WHERE s.status = 'ACTIVE'
       ORDER BY c.grade_level NULLS LAST, c.name NULLS LAST, s.full_name ASC`,
    );

    return {
      format: 'DAPODIK_EMIS_EXPORT_V1',
      exportedAt: new Date().toISOString(),
      totalActiveStudents: rows.length,
      records: rows,
    };
  }

  listTeachers() {
    return this.pg.query(
      `SELECT t.id, t.user_id, u.username, t.nip_nuptk, t.full_name,
              t.employment_status, t.position
       FROM iam_master.teachers_and_staff t
       JOIN iam_master.users u ON u.id = t.user_id
       ORDER BY t.full_name ASC`,
    );
  }

  async createTeacher(dto: CreateTeacherDto) {
    const passwordHash = await hashSecret(dto.password);
    try {
      return await this.pg.withTransaction(async (client) => {
        const roleRes = await client.query<{ id: string }>(
          `SELECT id FROM iam_master.roles WHERE code = 'GURU' LIMIT 1`,
        );
        const userRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.users (username, password_hash)
           VALUES ($1, $2) RETURNING id`,
          [dto.username.trim(), passwordHash],
        );
        const userId = userRes.rows[0].id;
        if (roleRes.rows.length > 0) {
          await client.query(
            'INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2)',
            [userId, roleRes.rows[0].id],
          );
        }

        const teacherRes = await client.query(
          `INSERT INTO iam_master.teachers_and_staff
             (user_id, nip_nuptk, full_name, employment_status, position)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, user_id, nip_nuptk, full_name, employment_status, position`,
          [
            userId,
            dto.nipNuptk ?? null,
            dto.fullName.trim(),
            dto.employmentStatus,
            dto.position.trim(),
          ],
        );
        return teacherRes.rows[0];
      });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new ConflictException('Username or NIP/NUPTK already exists');
      }
      throw err;
    }
  }

  async getDashboardSummary() {
    const [period, studentAgg, classroomAgg, ppdbAgg, invoiceAgg, attendanceAgg, ewsRows] =
      await Promise.all([
        this.pg.queryOne<AcademicPeriodRow>(
          `SELECT id, name, semester, start_date, end_date, is_active
           FROM academic_lms.academic_periods
           WHERE is_active = TRUE
           ORDER BY start_date DESC LIMIT 1`,
        ),
        this.pg.queryOne<{ active_students: string; candidate_students: string }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'ACTIVE')::text AS active_students,
             COUNT(*) FILTER (WHERE status = 'CANDIDATE')::text AS candidate_students
           FROM iam_master.students`,
        ),
        this.pg.queryOne<{ total_classrooms: string }>(
          `SELECT COUNT(*)::text AS total_classrooms FROM academic_lms.classrooms`,
        ),
        this.pg.queryOne<{ total_ppdb: string; verified_or_accepted: string }>(
          `SELECT
             COUNT(*)::text AS total_ppdb,
             COUNT(*) FILTER (WHERE verification_status IN ('VERIFIED', 'ACCEPTED', 'MIGRATED'))::text AS verified_or_accepted
           FROM academic_lms.ppdb_applications`,
        ),
        this.pg.queryOne<{ paid_total: string; unpaid_total: string; paid_count: string; unpaid_count: string }>(
          `SELECT
             COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::text AS paid_total,
             COALESCE(SUM(amount) FILTER (WHERE status = 'UNPAID'), 0)::text AS unpaid_total,
             COUNT(*) FILTER (WHERE status = 'PAID')::text AS paid_count,
             COUNT(*) FILTER (WHERE status = 'UNPAID')::text AS unpaid_count
           FROM finance_analytics.invoices`,
        ),
        this.pg.queryOne<{ present_count: string; late_count: string; absent_count: string }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'PRESENT')::text AS present_count,
             COUNT(*) FILTER (WHERE status = 'LATE')::text AS late_count,
             COUNT(*) FILTER (WHERE status IN ('SICK', 'PERMIT', 'ALPHA'))::text AS absent_count
           FROM high_speed_ops.attendances
           WHERE date = CURRENT_DATE`,
        ),
        this.pg.query<{
          id: string;
          student_id: string;
          full_name: string;
          nisn: string | null;
          classroom_name: string | null;
          risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
          attendance_risk_score: number;
          academic_drop_score: number;
          recommended_action: string;
          is_resolved_by_bk: boolean;
          calculated_date: string;
        }>(
          `SELECT e.id, e.student_id, s.full_name, s.nisn,
                  c.name AS classroom_name, e.risk_level,
                  e.attendance_risk_score, e.academic_drop_score,
                  e.recommended_action, e.is_resolved_by_bk,
                  e.calculated_date::text AS calculated_date
           FROM finance_analytics.ews_student_risk_scores e
           JOIN iam_master.students s ON s.id = e.student_id
           LEFT JOIN academic_lms.classroom_members cm ON cm.student_id = s.id
           LEFT JOIN academic_lms.classrooms c ON c.id = cm.classroom_id
           ORDER BY e.is_resolved_by_bk ASC,
                    CASE e.risk_level WHEN 'CRITICAL' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
                    e.attendance_risk_score DESC
           LIMIT 30`,
        ),
      ]);

    const activeStudents = Number(studentAgg?.active_students ?? 0);
    const presentToday = Number(attendanceAgg?.present_count ?? 0) + Number(attendanceAgg?.late_count ?? 0);
    const paidAmount = Number(invoiceAgg?.paid_total ?? 0);
    const unpaidAmount = Number(invoiceAgg?.unpaid_total ?? 0);
    const totalBilled = paidAmount + unpaidAmount;
    const collectionRate = totalBilled > 0 ? Math.round((paidAmount / totalBilled) * 1000) / 10 : 100;

    return {
      period: period?.name ?? 'TA 2026/2027 Ganjil',
      kpis: {
        activeStudents,
        presentToday: presentToday > 0 ? presentToday : activeStudents,
        attendanceRate: activeStudents > 0 ? Math.round(((presentToday > 0 ? presentToday : activeStudents) / activeStudents) * 1000) / 10 : 0,
        totalClassrooms: Number(classroomAgg?.total_classrooms ?? 0),
        totalPpdbApplicants: Number(ppdbAgg?.total_ppdb ?? 0),
        verifiedPpdbApplicants: Number(ppdbAgg?.verified_or_accepted ?? 0),
        paidInvoiceAmount: paidAmount,
        unpaidInvoiceAmount: unpaidAmount,
        collectionRate,
        unresolvedCriticalEws: ewsRows.filter((r) => r.risk_level === 'CRITICAL' && !r.is_resolved_by_bk).length,
        unresolvedMediumEws: ewsRows.filter((r) => r.risk_level === 'MEDIUM' && !r.is_resolved_by_bk).length,
      },
      ewsRows,
    };
  }

  async resolveEwsRisk(ewsId: string) {
    const updated = await this.pg.queryOne<{ id: string; is_resolved_by_bk: boolean }>(
      `UPDATE finance_analytics.ews_student_risk_scores
       SET is_resolved_by_bk = TRUE
       WHERE id = $1
       RETURNING id, is_resolved_by_bk`,
      [ewsId],
    );
    if (!updated) {
      throw new NotFoundException('EWS risk record not found');
    }
    return updated;
  }

  async getStudentProfile360(studentId: string) {
    const student = await this.pg.queryOne<{
      id: string;
      user_id: string;
      nis: string | null;
      nisn: string | null;
      nik: string | null;
      full_name: string;
      gender: string | null;
      birth_date: string | null;
      blood_type: string | null;
      allergy_notes: string | null;
      status: string;
      dapodik_sync_id: string | null;
      email: string | null;
      phone: string | null;
      classroom_name: string | null;
      grade_level: number | null;
      rfid_uid: string | null;
    }>(
      `SELECT s.id, s.user_id, s.nis, s.nisn, s.nik, s.full_name, s.gender,
              s.birth_date::text AS birth_date, s.blood_type, s.allergy_notes,
              s.status, s.dapodik_sync_id, u.email, u.phone,
              c.name AS classroom_name, c.grade_level,
              ic.rfid_uid
       FROM iam_master.students s
       JOIN iam_master.users u ON u.id = s.user_id
       LEFT JOIN academic_lms.classroom_members cm ON cm.student_id = s.id
       LEFT JOIN academic_lms.classrooms c ON c.id = cm.classroom_id
       LEFT JOIN iam_master.identity_cards ic ON ic.user_id = s.user_id AND ic.card_status = 'ACTIVE'
       WHERE s.id = $1`,
      [studentId],
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [parents, grades, attendanceSummary] = await Promise.all([
      this.pg.query<{ full_name: string; occupation: string | null; relation_type: string; phone: string | null }>(
        `SELECT p.full_name, p.occupation, spr.relation_type, u.phone
         FROM iam_master.student_parent_relations spr
         JOIN iam_master.parents p ON p.id = spr.parent_id
         JOIN iam_master.users u ON u.id = p.user_id
         WHERE spr.student_id = $1`,
        [studentId],
      ),
      this.pg.query<{
        id: string;
        subject_code: string;
        subject_name: string;
        assessment_type: string;
        score: string;
        competency_notes: string | null;
      }>(
        `SELECT g.id, sub.code AS subject_code, sub.name AS subject_name,
                g.assessment_type, g.score::text AS score, g.competency_notes
         FROM academic_lms.grades g
         JOIN academic_lms.subjects sub ON sub.id = g.subject_id
         WHERE g.student_id = $1
         ORDER BY g.recorded_at DESC
         LIMIT 20`,
        [studentId],
      ),
      this.pg.queryOne<{ present: string; sick: string; permit: string; alpha: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status IN ('PRESENT', 'LATE'))::text AS present,
           COUNT(*) FILTER (WHERE status = 'SICK')::text AS sick,
           COUNT(*) FILTER (WHERE status = 'PERMIT')::text AS permit,
           COUNT(*) FILTER (WHERE status = 'ALPHA')::text AS alpha
         FROM high_speed_ops.attendances
         WHERE user_id = $1`,
        [student.user_id],
      ),
    ]);

    return {
      student,
      parents,
      grades,
      attendance: {
        present: Number(attendanceSummary?.present ?? 0),
        sick: Number(attendanceSummary?.sick ?? 0),
        permit: Number(attendanceSummary?.permit ?? 0),
        alpha: Number(attendanceSummary?.alpha ?? 0),
      },
    };
  }

  async listTeachingJournals() {
    const [schedules, journals] = await Promise.all([
      this.pg.query<{
        id: string;
        classroom_id: string;
        classroom_name: string;
        subject_id: string;
        subject_name: string;
        teacher_id: string;
        teacher_name: string;
        room_code: string | null;
        day_of_week: number;
        start_time: string;
        end_time: string;
      }>(
        `SELECT sch.id, sch.classroom_id, c.name AS classroom_name,
                sch.subject_id, sub.name AS subject_name,
                sch.teacher_id, t.full_name AS teacher_name,
                sch.room_code, sch.day_of_week,
                TO_CHAR(sch.start_time, 'HH24:MI') AS start_time,
                TO_CHAR(sch.end_time, 'HH24:MI') AS end_time
         FROM academic_lms.schedules sch
         JOIN academic_lms.classrooms c ON c.id = sch.classroom_id
         JOIN academic_lms.subjects sub ON sub.id = sch.subject_id
         JOIN iam_master.teachers_and_staff t ON t.id = sch.teacher_id
         ORDER BY sch.day_of_week ASC, sch.start_time ASC`,
      ),
      this.pg.query<{
        id: string;
        schedule_id: string;
        session_date: string;
        topic: string;
        notes: string | null;
        logged_at: Date;
        classroom_name: string;
        subject_name: string;
        teacher_name: string;
      }>(
        `SELECT j.id, j.schedule_id, j.session_date::text AS session_date,
                j.topic, j.notes, j.logged_at,
                c.name AS classroom_name, sub.name AS subject_name, t.full_name AS teacher_name
         FROM academic_lms.teaching_journals j
         JOIN academic_lms.schedules sch ON sch.id = j.schedule_id
         JOIN academic_lms.classrooms c ON c.id = sch.classroom_id
         JOIN academic_lms.subjects sub ON sub.id = sch.subject_id
         JOIN iam_master.teachers_and_staff t ON t.id = j.teacher_id
         ORDER BY j.logged_at DESC
         LIMIT 20`,
      ),
    ]);
    return { schedules, journals };
  }

  async createTeachingJournal(input: {
    scheduleId: string;
    topic: string;
    notes?: string;
    attendance?: Array<{ studentUserId: string; status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ALPHA' }>;
  }) {
    const schedule = await this.pg.queryOne<{ id: string; teacher_id: string }>(
      `SELECT id, teacher_id FROM academic_lms.schedules WHERE id = $1`,
      [input.scheduleId],
    );
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.pg.withTransaction(async (client) => {
      const inserted = await client.query<{
        id: string;
        schedule_id: string;
        session_date: string;
        topic: string;
        notes: string | null;
        logged_at: Date;
      }>(
        `INSERT INTO academic_lms.teaching_journals (schedule_id, teacher_id, session_date, topic, notes)
         VALUES ($1, $2, CURRENT_DATE, $3, $4)
         RETURNING id, schedule_id, session_date::text AS session_date, topic, notes, logged_at`,
        [input.scheduleId, schedule.teacher_id, input.topic.trim(), input.notes?.trim() ?? null],
      );

      if (input.attendance && input.attendance.length > 0) {
        for (const row of input.attendance) {
          await client.query(
            `INSERT INTO high_speed_ops.attendances (user_id, date, check_in_time, status, verification_method)
             VALUES ($1, CURRENT_DATE, NOW(), $2, 'MANUAL')
             ON CONFLICT (user_id, date) DO UPDATE SET status = EXCLUDED.status`,
            [row.studentUserId, row.status],
          );
        }
      }

      return inserted.rows[0];
    });
  }
}

