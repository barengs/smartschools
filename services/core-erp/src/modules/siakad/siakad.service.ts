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
}
