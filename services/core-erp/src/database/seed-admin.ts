import { loadAppConfig } from '../config/env.config';
import { PgService } from './pg.service';
import { hashSecret } from '../modules/iam/password.util';

async function main() {
  const cfg = loadAppConfig();
  const pg = new PgService(cfg.databaseUrl);
  const username = process.env.SEED_ADMIN_USERNAME ?? 'superadmin';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@smartschool.sch.id';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'AdminSmartSchool123!';

  try {
    const passwordHash = await hashSecret(password);
    await pg.withTransaction(async (client) => {
      const userRes = await client.query<{ id: string }>(
        `INSERT INTO iam_master.users (username, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [username, email, passwordHash],
      );
      const userId = userRes.rows[0].id;

      const roleRes = await client.query<{ id: string }>(
        `SELECT id FROM iam_master.roles WHERE code = 'SUPER_ADMIN' LIMIT 1`,
      );
      if (roleRes.rows.length === 0) {
        throw new Error('SUPER_ADMIN role not found. Run SQL migrations 006_seed_rbac.sql first.');
      }
      const roleId = roleRes.rows[0].id;

      await client.query(
        `INSERT INTO iam_master.user_roles (user_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, roleId],
      );

      await client.query(
        `INSERT INTO iam_master.role_permissions (role_id, permission_id)
         SELECT $1, id FROM iam_master.permissions
         ON CONFLICT DO NOTHING`,
        [roleId],
      );

      // Idempotent realistic academic, PPDB & EWS starter dataset
      const periodRes = await client.query<{ id: string }>(
        `SELECT id FROM academic_lms.academic_periods WHERE name = 'TA 2026/2027' AND semester = 'ODD' LIMIT 1`,
      );
      let periodId = periodRes.rows[0]?.id;
      if (!periodId) {
        const insPeriod = await client.query<{ id: string }>(
          `INSERT INTO academic_lms.academic_periods (name, semester, start_date, end_date, is_active)
           VALUES ('TA 2026/2027', 'ODD', '2026-07-13', '2026-12-19', TRUE)
           RETURNING id`,
        );
        periodId = insPeriod.rows[0].id;
      }

      const subjectSeeds = [
        { code: 'MTK-L', name: 'Matematika Tingkat Lanjut', hours: 4, lab: false },
        { code: 'FIS-T', name: 'Fisika Terapan & Lab', hours: 4, lab: true },
        { code: 'BIN-A', name: 'Bahasa Indonesia Akademik', hours: 4, lab: false },
        { code: 'INF-P', name: 'Informatika & Pemrograman', hours: 3, lab: true },
        { code: 'PKN-0', name: 'Pendidikan Pancasila', hours: 2, lab: false },
      ];
      const subjectIds: Record<string, string> = {};
      for (const s of subjectSeeds) {
        const res = await client.query<{ id: string }>(
          `INSERT INTO academic_lms.subjects (code, name, weekly_hours, requires_lab)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [s.code, s.name, s.hours, s.lab],
        );
        subjectIds[s.code] = res.rows[0].id;
      }

      // Seed demo teachers
      const guruRole = await client.query<{ id: string }>(`SELECT id FROM iam_master.roles WHERE code = 'GURU' LIMIT 1`);
      const teacherSeeds = [
        { username: 'guru.bambang', email: 'bambang@smartschool.sch.id', nip: '197804122003121004', name: 'Drs. Bambang Sudarmono, M.Si', pos: 'Guru Fisika Madya' },
        { username: 'guru.ratna', email: 'ratna@smartschool.sch.id', nip: '198004122005012001', name: 'Dra. Hj. Ratna Juwita', pos: 'Wali Kelas XI MIPA 1' },
      ];
      const teacherIds: string[] = [];
      for (const t of teacherSeeds) {
        const uRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.users (username, email, password_hash)
           VALUES ($1, $2, $3)
           ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [t.username, t.email, passwordHash],
        );
        if (guruRole.rows.length > 0) {
          await client.query(
            `INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [uRes.rows[0].id, guruRole.rows[0].id],
          );
        }
        const tRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.teachers_and_staff (user_id, nip_nuptk, full_name, employment_status, position)
           VALUES ($1, $2, $3, 'PNS', $4)
           ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
           RETURNING id`,
          [uRes.rows[0].id, t.nip, t.name, t.pos],
        );
        teacherIds.push(tRes.rows[0].id);
      }

      const classroomSeeds = [
        { name: 'Kelas XI MIPA 1', grade: 11, room: 'R.201' },
        { name: 'Kelas XI MIPA 2', grade: 11, room: 'R.202' },
        { name: 'Kelas X-A', grade: 10, room: 'R.101' },
        { name: 'Kelas X-B', grade: 10, room: 'R.102' },
        { name: 'Kelas XII IPS 1', grade: 12, room: 'R.301' },
      ];
      const classroomIds: Record<string, string> = {};
      for (const c of classroomSeeds) {
        const cRes = await client.query<{ id: string }>(
          `INSERT INTO academic_lms.classrooms (academic_period_id, name, grade_level, homeroom_teacher_id, room_code)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (academic_period_id, name) DO UPDATE SET room_code = EXCLUDED.room_code
           RETURNING id`,
          [periodId, c.name, c.grade, teacherIds[0] ?? null, c.room],
        );
        classroomIds[c.name] = cRes.rows[0].id;
      }

      // Seed active students + grades + EWS risk alerts
      const siswaRole = await client.query<{ id: string }>(`SELECT id FROM iam_master.roles WHERE code = 'SISWA' LIMIT 1`);
      const activeStudentSeeds = [
        { username: 'siswa.farhan', nis: '202610042', nisn: '0087462918', nik: '3174092204080003', name: 'Muhammad Farhan', gender: 'MALE', room: 'Kelas XI MIPA 1', ews: null },
        { username: 'siswa.rafi', nis: '202610043', nisn: '0087421990', nik: '3174092204080004', name: 'Rafi Maulana', gender: 'MALE', room: 'Kelas XI MIPA 2', ews: { level: 'CRITICAL', att: 91, acad: 84, action: 'Panggilan Konseling BK & Home Visit' } },
        { username: 'siswa.annisa', nis: '202610044', nisn: '0081294821', nik: '3174092204080005', name: 'Annisa Nuraini', gender: 'FEMALE', room: 'Kelas X-B', ews: { level: 'CRITICAL', att: 88, acad: 79, action: 'Klarifikasi Finansial & Beasiswa Lazis' } },
        { username: 'siswa.bintang', nis: '202610045', nisn: '0079301248', nik: '3174092204080006', name: 'Bintang Pratama', gender: 'MALE', room: 'Kelas XII IPS 1', ews: { level: 'CRITICAL', att: 86, acad: 76, action: 'Panggilan Orang Tua & Pembinaan Wali' } },
        { username: 'siswa.dinda', nis: '202610046', nisn: '0085521903', nik: '3174092204080007', name: 'Dinda Kirana', gender: 'FEMALE', room: 'Kelas X-A', ews: { level: 'MEDIUM', att: 64, acad: 68, action: 'Pendampingan Guru Mata Pelajaran' } },
        { username: 'siswa.fauzan', nis: '202610047', nisn: '0089901452', nik: '3174092204080008', name: 'Fauzan Zaidan', gender: 'MALE', room: 'Kelas X-B', ews: { level: 'MEDIUM', att: 58, acad: 62, action: 'Koordinasi Rekam Medis UKS & Orang Tua' } },
      ];

      for (const st of activeStudentSeeds) {
        const uRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.users (username, email, password_hash)
           VALUES ($1, $2, $3)
           ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [st.username, `${st.username}@student.smartschool.sch.id`, passwordHash],
        );
        const studentUserId = uRes.rows[0].id;
        if (siswaRole.rows.length > 0) {
          await client.query(
            `INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [studentUserId, siswaRole.rows[0].id],
          );
        }
        const sRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.students (user_id, nis, nisn, nik, full_name, gender, status, dapodik_sync_id, blood_type)
           VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, 'O')
           ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'ACTIVE'
           RETURNING id`,
          [studentUserId, st.nis, st.nisn, st.nik, st.name, st.gender, `DAPODIK-${st.nis}`],
        );
        const studentId = sRes.rows[0].id;
        const targetRoomId = classroomIds[st.room];
        if (targetRoomId) {
          await client.query(
            `INSERT INTO academic_lms.classroom_members (classroom_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [targetRoomId, studentId],
          );
        }
        await client.query(
          `INSERT INTO high_speed_ops.attendances (user_id, date, check_in_time, status, verification_method)
           VALUES ($1, CURRENT_DATE, NOW(), 'PRESENT', 'RFID_GATE')
           ON CONFLICT (user_id, date) DO NOTHING`,
          [studentUserId],
        );
        if (st.ews) {
          await client.query(
            `INSERT INTO finance_analytics.ews_student_risk_scores
               (student_id, calculated_date, attendance_risk_score, academic_drop_score, risk_level, recommended_action)
             VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
             ON CONFLICT (student_id, calculated_date) DO NOTHING`,
            [studentId, st.ews.att, st.ews.acad, st.ews.level, st.ews.action],
          );
        }
      }

      // Seed demo PPDB candidates so Selection Status Lookup & Recap are backed by PostgreSQL
      const ppdbSeeds = [
        { reg: 'PPDB-2026-0191', username: 'ppdb.aisyah', nisn: '0089112204', nik: '3271045501090003', name: 'Aisyah Azzahra Putri', gender: 'FEMALE', track: 'ZONASI', school: 'SMP Negeri 1 Kota Bogor', status: 'ACCEPTED' },
        { reg: 'PPDB-2026-0012', username: 'ppdb.fadhil', nisn: '0081122301', nik: '3271041205090001', name: 'Muhammad Fadhil Al-Ghifari', gender: 'MALE', track: 'PRESTASI', school: 'SMP Negeri 1 Bogor', status: 'ACCEPTED' },
        { reg: 'PPDB-2026-0245', username: 'ppdb.clara', nisn: '0084419902', nik: '3271046602090002', name: 'Clara Anastya Pramesti', gender: 'FEMALE', track: 'PRESTASI', school: 'SMP IT Al-Madinah', status: 'ACCEPTED' },
        { reg: 'PPDB-2026-0412', username: 'ppdb.rizky', nisn: '0087718820', nik: '3271041908090004', name: 'Rizky Ramadhan Hakim', gender: 'MALE', track: 'AFIRMASI', school: 'SMP Negeri 4 Citeureup', status: 'ACCEPTED' },
        { reg: 'PPDB-2026-0560', username: 'ppdb.galang', nisn: '0083309921', nik: '3271041111090005', name: 'Galang Pratama Dewa', gender: 'MALE', track: 'ZONASI', school: 'SMP Negeri 2 Sukaraja', status: 'SUBMITTED' },
        { reg: 'PPDB-2026-0774', username: 'ppdb.nabila', nisn: '0082201140', nik: '3271045203090006', name: 'Nabila Kayla Zhafira', gender: 'FEMALE', track: 'MUTASI', school: 'SMP Bina Bangsa Mandiri', status: 'SUBMITTED' },
      ];
      for (const p of ppdbSeeds) {
        const uRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.users (username, email, password_hash)
           VALUES ($1, $2, $3)
           ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [p.username, `${p.username}@ppdb.smartschool.sch.id`, passwordHash],
        );
        const sRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.students (user_id, nisn, nik, full_name, gender, status)
           VALUES ($1, $2, $3, $4, $5, 'CANDIDATE')
           ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
           RETURNING id`,
          [uRes.rows[0].id, p.nisn, p.nik, p.name, p.gender],
        );
        await client.query(
          `INSERT INTO academic_lms.ppdb_applications
             (registration_number, academic_period_id, student_id, admission_track, previous_school, parent_name, parent_phone, verification_status)
           VALUES ($1, $2, $3, $4, $5, $6, '081234567890', $7)
           ON CONFLICT (registration_number) DO UPDATE SET verification_status = EXCLUDED.verification_status`,
          [p.reg, periodId, sRes.rows[0].id, p.track, p.school, `Wali ${p.name}`, p.status],
        );
      }

      // Seed at least one daily teaching schedule for Jurnal KBM
      const existingSch = await client.query<{ id: string }>(
        `SELECT id FROM academic_lms.schedules LIMIT 1`,
      );
      if (existingSch.rows.length === 0 && teacherIds[0] && classroomIds['Kelas XI MIPA 1'] && subjectIds['FIS-T']) {
        await client.query(
          `INSERT INTO academic_lms.schedules
             (academic_period_id, classroom_id, subject_id, teacher_id, room_code, day_of_week, start_time, end_time)
           VALUES
             ($1, $2, $3, $4, 'Lab Fisika 2', 3, '08:45', '10:15'),
             ($1, $5, $6, $4, 'R.101', 3, '07:15', '08:45')`,
          [
            periodId,
            classroomIds['Kelas XI MIPA 1'],
            subjectIds['FIS-T'],
            teacherIds[0],
            classroomIds['Kelas X-A'],
            subjectIds['MTK-L'],
          ],
        );
      }
    });

    console.log(`✅ Seeded SUPER_ADMIN account & demo academic/PPDB dataset: ${username} (${email})`);
  } finally {
    await pg.onModuleDestroy();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

