import * as crypto from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PgService } from '../../database/pg.service';
import { AuthenticatedUser } from '../iam/iam.types';
import { hashSecret } from '../iam/password.util';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';
import {
  AttachPpdbDocumentDto,
  MigratePpdbDto,
  PresignPpdbDocumentDto,
  RegisterPpdbDto,
  VerifyPpdbDto,
} from './dto/ppdb.dto';

export interface PpdbApplicationRow {
  id: string;
  registration_number: string;
  academic_period_id: string | null;
  student_id: string;
  student_user_id: string;
  student_username: string;
  full_name: string;
  nis: string | null;
  nisn: string | null;
  gender: string | null;
  admission_track: string;
  previous_school: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  documents_jsonb: Array<{
    documentType: string;
    objectKey: string;
    fileName: string;
    uploadedAt: string;
  }>;
  verification_status: string;
  verification_notes: string | null;
  invoice_id: string | null;
  migrated_at: Date | null;
  created_at: Date;
}

@Injectable()
export class PpdbService {
  constructor(
    private readonly pg: PgService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  async register(dto: RegisterPpdbDto) {
    const passwordHash = await hashSecret(dto.password);
    const regNumber = this.generateRegNumber();

    try {
      const result = await this.pg.withTransaction(async (client) => {
        const siswaRole = await client.query<{ id: string }>(
          `SELECT id FROM iam_master.roles WHERE code = 'SISWA' LIMIT 1`,
        );
        if (siswaRole.rows.length === 0) {
          throw new BadRequestException('SISWA role is not seeded');
        }

        const userRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.users (username, email, phone, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [dto.username.trim(), dto.email?.trim() ?? null, dto.phone ?? null, passwordHash],
        );
        const userId = userRes.rows[0].id;

        await client.query(
          'INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2)',
          [userId, siswaRole.rows[0].id],
        );

        const studentRes = await client.query<{ id: string }>(
          `INSERT INTO iam_master.students
             (user_id, nisn, nik, full_name, gender, birth_date, blood_type, allergy_notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CANDIDATE')
           RETURNING id`,
          [
            userId,
            dto.nisn ?? null,
            dto.nik ?? null,
            dto.fullName.trim(),
            dto.gender,
            dto.birthDate ?? null,
            dto.bloodType ?? null,
            dto.allergyNotes ?? null,
          ],
        );
        const studentId = studentRes.rows[0].id;

        let invoiceId: string | null = null;
        if (dto.ppdbFeeAmount && dto.ppdbFeeAmount > 0) {
          const invNum = `INV-PPDB-${Date.now()}-${crypto.randomInt(100, 999)}`;
          const dueDate = new Date(Date.now() + 7 * 24 * 3600 * 1000)
            .toISOString()
            .slice(0, 10);
          const invRes = await client.query<{ id: string }>(
            `INSERT INTO finance_analytics.invoices
               (invoice_number, student_id, billing_type, amount, due_date, status)
             VALUES ($1, $2, 'PPDB_FEE', $3, $4, 'UNPAID')
             RETURNING id`,
            [invNum, studentId, dto.ppdbFeeAmount, dueDate],
          );
          invoiceId = invRes.rows[0].id;
        }

        const appRes = await client.query<{
          id: string;
          registration_number: string;
          verification_status: string;
          created_at: Date;
        }>(
          `INSERT INTO academic_lms.ppdb_applications
             (registration_number, academic_period_id, student_id, admission_track,
              previous_school, parent_name, parent_phone, parent_email, invoice_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, registration_number, verification_status, created_at`,
          [
            regNumber,
            dto.academicPeriodId ?? null,
            studentId,
            dto.admissionTrack,
            dto.previousSchool ?? null,
            dto.parentName.trim(),
            dto.parentPhone.trim(),
            dto.parentEmail?.trim() ?? null,
            invoiceId,
          ],
        );

        return {
          applicationId: appRes.rows[0].id,
          registrationNumber: appRes.rows[0].registration_number,
          verificationStatus: appRes.rows[0].verification_status,
          studentId,
          userId,
          invoiceId,
          createdAt: appRes.rows[0].created_at,
        };
      });

      await this.notifications.publishDomainEvent('PpdbRegistered', {
        applicationId: result.applicationId,
        registrationNumber: result.registrationNumber,
        fullName: dto.fullName,
      });

      await this.notifications.enqueueNotification({
        channel: 'WHATSAPP',
        recipient: dto.parentPhone,
        title: 'Pendaftaran E-PPDB Berhasil',
        body: `Pendaftaran ${dto.fullName} tercatat dengan nomor ${result.registrationNumber}. Silakan unggah berkas persyaratan.`,
      });

      return result;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new ConflictException('Username, email, NISN, or NIK already registered');
      }
      throw err;
    }
  }

  async listApplications(status?: string) {
    const params: unknown[] = [];
    let whereClause = '';
    if (status) {
      params.push(status);
      whereClause = 'WHERE a.verification_status = $1';
    }

    return this.pg.query<PpdbApplicationRow>(
      `SELECT a.id, a.registration_number, a.academic_period_id, a.student_id,
              s.user_id AS student_user_id, u.username AS student_username,
              s.full_name, s.nis, s.nisn, s.gender,
              a.admission_track, a.previous_school,
              a.parent_name, a.parent_phone, a.parent_email,
              a.documents_jsonb, a.verification_status, a.verification_notes,
              a.invoice_id, a.migrated_at, a.created_at
       FROM academic_lms.ppdb_applications a
       JOIN iam_master.students s ON s.id = a.student_id
       JOIN iam_master.users u ON u.id = s.user_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT 200`,
      params,
    );
  }

  async getApplicationById(id: string): Promise<PpdbApplicationRow> {
    const row = await this.pg.queryOne<PpdbApplicationRow>(
      `SELECT a.id, a.registration_number, a.academic_period_id, a.student_id,
              s.user_id AS student_user_id, u.username AS student_username,
              s.full_name, s.nis, s.nisn, s.gender,
              a.admission_track, a.previous_school,
              a.parent_name, a.parent_phone, a.parent_email,
              a.documents_jsonb, a.verification_status, a.verification_notes,
              a.invoice_id, a.migrated_at, a.created_at
       FROM academic_lms.ppdb_applications a
       JOIN iam_master.students s ON s.id = a.student_id
       JOIN iam_master.users u ON u.id = s.user_id
       WHERE a.id = $1`,
      [id],
    );
    if (!row) {
      throw new NotFoundException('PPDB application not found');
    }
    return row;
  }

  async getMyApplication(userId: string) {
    const row = await this.pg.queryOne<PpdbApplicationRow>(
      `SELECT a.id, a.registration_number, a.academic_period_id, a.student_id,
              s.user_id AS student_user_id, u.username AS student_username,
              s.full_name, s.nis, s.nisn, s.gender,
              a.admission_track, a.previous_school,
              a.parent_name, a.parent_phone, a.parent_email,
              a.documents_jsonb, a.verification_status, a.verification_notes,
              a.invoice_id, a.migrated_at, a.created_at
       FROM academic_lms.ppdb_applications a
       JOIN iam_master.students s ON s.id = a.student_id
       JOIN iam_master.users u ON u.id = s.user_id
       WHERE s.user_id = $1`,
      [userId],
    );
    if (!row) {
      throw new NotFoundException('No PPDB application found for current user');
    }
    return row;
  }

  async presignDocument(
    applicationId: string,
    dto: PresignPpdbDocumentDto,
    actor: AuthenticatedUser,
  ) {
    const app = await this.getApplicationById(applicationId);
    this.assertOwnerOrStaff(app.student_user_id, actor);

    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${applicationId}/${dto.documentType.toLowerCase()}-${Date.now()}-${safeName}`;
    return this.storage.presignUpload('ppdb-docs', objectKey, 900);
  }

  async attachDocument(
    applicationId: string,
    dto: AttachPpdbDocumentDto,
    actor: AuthenticatedUser,
  ) {
    const app = await this.getApplicationById(applicationId);
    this.assertOwnerOrStaff(app.student_user_id, actor);

    if (!dto.objectKey.startsWith(`${applicationId}/`)) {
      throw new BadRequestException('objectKey must belong to this application');
    }

    const updatedDocs = [
      ...(app.documents_jsonb ?? []),
      {
        documentType: dto.documentType,
        objectKey: dto.objectKey,
        fileName: dto.fileName,
        uploadedAt: new Date().toISOString(),
      },
    ];

    const nextStatus =
      app.verification_status === 'DRAFT' ? 'SUBMITTED' : app.verification_status;

    const updated = await this.pg.queryOne<{
      id: string;
      verification_status: string;
      documents_jsonb: unknown;
    }>(
      `UPDATE academic_lms.ppdb_applications
       SET documents_jsonb = $2::jsonb,
           verification_status = $3
       WHERE id = $1
       RETURNING id, verification_status, documents_jsonb`,
      [applicationId, JSON.stringify(updatedDocs), nextStatus],
    );

    return updated;
  }

  async verifyApplication(
    applicationId: string,
    dto: VerifyPpdbDto,
    verifierUserId: string,
  ) {
    const app = await this.getApplicationById(applicationId);
    if (app.verification_status === 'MIGRATED') {
      throw new BadRequestException('Cannot modify an already migrated application');
    }

    const updated = await this.pg.queryOne<{
      id: string;
      registration_number: string;
      verification_status: string;
      verification_notes: string | null;
      verified_at: Date;
    }>(
      `UPDATE academic_lms.ppdb_applications
       SET verification_status = $2,
           verification_notes = $3,
           verified_by = $4,
           verified_at = NOW()
       WHERE id = $1
       RETURNING id, registration_number, verification_status, verification_notes, verified_at`,
      [applicationId, dto.status, dto.notes ?? null, verifierUserId],
    );

    await this.notifications.enqueueNotification({
      channel: 'WHATSAPP',
      recipient: app.parent_phone,
      title: `Status E-PPDB: ${dto.status}`,
      body: `Berkas pendaftaran ${app.full_name} (${app.registration_number}) kini berstatus ${dto.status}.`,
    });

    return updated;
  }

  /**
   * One-Click Migration: converts ACCEPTED candidate into ACTIVE Buku Induk student,
   * provisions parent relation, canteen wallet, identity card, and optional classroom assignment.
   */
  async oneClickMigrate(applicationId: string, dto: MigratePpdbDto) {
    const migrationResult = await this.pg.withTransaction(async (client) => {
      const appRes = await client.query<PpdbApplicationRow>(
        `SELECT a.id, a.registration_number, a.academic_period_id, a.student_id,
                s.user_id AS student_user_id, u.username AS student_username,
                s.full_name, s.nis, a.parent_name, a.parent_phone, a.parent_email,
                a.verification_status
         FROM academic_lms.ppdb_applications a
         JOIN iam_master.students s ON s.id = a.student_id
         JOIN iam_master.users u ON u.id = s.user_id
         WHERE a.id = $1
         FOR UPDATE OF a`,
        [applicationId],
      );

      if (appRes.rows.length === 0) {
        throw new NotFoundException('PPDB application not found');
      }

      const app = appRes.rows[0];
      if (app.verification_status === 'MIGRATED') {
        throw new ConflictException('Application already migrated to Buku Induk');
      }
      if (app.verification_status !== 'ACCEPTED') {
        throw new BadRequestException(
          `Application must be ACCEPTED before migration (current: ${app.verification_status})`,
        );
      }

      const assignedNis =
        dto.nis?.trim() ??
        `${new Date().getFullYear()}${crypto.randomInt(100000, 999999)}`;

      await client.query(
        `UPDATE iam_master.students
         SET status = 'ACTIVE', nis = COALESCE(nis, $2)
         WHERE id = $1`,
        [app.student_id, assignedNis],
      );

      // Provision ORANG_TUA account & student-parent link
      const parentRoleRes = await client.query<{ id: string }>(
        `SELECT id FROM iam_master.roles WHERE code = 'ORANG_TUA' LIMIT 1`,
      );
      if (parentRoleRes.rows.length === 0) {
        throw new BadRequestException('ORANG_TUA role is not seeded');
      }

      const parentUsername = `ortu_${app.student_username}`;
      const parentDefaultHash = await hashSecret(app.parent_phone);
      const parentUserRes = await client.query<{ id: string }>(
        `INSERT INTO iam_master.users (username, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO UPDATE SET phone = EXCLUDED.phone
         RETURNING id`,
        [parentUsername, app.parent_email, app.parent_phone, parentDefaultHash],
      );
      const parentUserId = parentUserRes.rows[0].id;

      await client.query(
        `INSERT INTO iam_master.user_roles (user_id, role_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [parentUserId, parentRoleRes.rows[0].id],
      );

      const parentRes = await client.query<{ id: string }>(
        `INSERT INTO iam_master.parents (user_id, full_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
         RETURNING id`,
        [parentUserId, app.parent_name],
      );

      await client.query(
        `INSERT INTO iam_master.student_parent_relations
           (student_id, parent_id, relation_type, is_primary_contact)
         VALUES ($1, $2, 'GUARDIAN', TRUE)
         ON CONFLICT DO NOTHING`,
        [app.student_id, parentRes.rows[0].id],
      );

      // Initialize cashless wallet & digital student card
      const walletRes = await client.query<{ id: string }>(
        `INSERT INTO high_speed_ops.wallets (user_id, balance, daily_spending_limit)
         VALUES ($1, 0, $2)
         ON CONFLICT (user_id) DO UPDATE SET daily_spending_limit = EXCLUDED.daily_spending_limit
         RETURNING id`,
        [app.student_user_id, dto.dailySpendingLimit ?? 25000],
      );

      const rfidUid = dto.rfidUid?.trim() ?? `TEMP-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
      const qrToken = crypto.randomUUID();
      await client.query(
        `INSERT INTO iam_master.identity_cards (user_id, rfid_uid, qr_token, card_status)
         VALUES ($1, $2, $3, 'ACTIVE')`,
        [app.student_user_id, rfidUid, qrToken],
      );

      if (dto.classroomId) {
        await client.query(
          `INSERT INTO academic_lms.classroom_members (classroom_id, student_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [dto.classroomId, app.student_id],
        );
      }

      const migratedApp = await client.query<{ migrated_at: Date }>(
        `UPDATE academic_lms.ppdb_applications
         SET verification_status = 'MIGRATED', migrated_at = NOW()
         WHERE id = $1
         RETURNING migrated_at`,
        [applicationId],
      );

      return {
        applicationId: app.id,
        registrationNumber: app.registration_number,
        studentId: app.student_id,
        nis: assignedNis,
        walletId: walletRes.rows[0].id,
        parentUsername,
        rfidUid,
        migratedAt: migratedApp.rows[0].migrated_at,
        parentPhone: app.parent_phone,
        fullName: app.full_name,
      };
    });

    await this.notifications.publishDomainEvent('StudentMigrated', {
      applicationId: migrationResult.applicationId,
      studentId: migrationResult.studentId,
      nis: migrationResult.nis,
      walletId: migrationResult.walletId,
    });

    await this.notifications.enqueueNotification({
      channel: 'WHATSAPP',
      recipient: migrationResult.parentPhone,
      title: 'Aktivasi Siswa & Akun Orang Tua',
      body: `Selamat! ${migrationResult.fullName} resmi terdaftar (NIS: ${migrationResult.nis}). Akun Orang Tua: ${migrationResult.parentUsername}.`,
    });

    return migrationResult;
  }

  async getPublicOverview() {
    const [periodRow, studentStats, trackStats] = await Promise.all([
      this.pg.queryOne<{ id: string; name: string; semester: string; end_date: string }>(
        `SELECT id, name, semester, end_date::text AS end_date
         FROM academic_lms.academic_periods
         WHERE is_active = TRUE
         ORDER BY start_date DESC
         LIMIT 1`,
      ),
      this.pg.queryOne<{ active_count: string; candidate_count: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'ACTIVE')::text AS active_count,
           COUNT(*) FILTER (WHERE status = 'CANDIDATE')::text AS candidate_count
         FROM iam_master.students`,
      ),
      this.pg.query<{
        admission_track: string;
        total_count: string;
        accepted_count: string;
      }>(
        `SELECT admission_track,
                COUNT(*)::text AS total_count,
                COUNT(*) FILTER (WHERE verification_status IN ('ACCEPTED', 'MIGRATED', 'VERIFIED'))::text AS accepted_count
         FROM academic_lms.ppdb_applications
         GROUP BY admission_track`,
      ),
    ]);

    const trackCounts = new Map<string, { total: number; accepted: number }>();
    for (const row of trackStats) {
      trackCounts.set(row.admission_track, {
        total: Number(row.total_count),
        accepted: Number(row.accepted_count),
      });
    }

    const activeStudents = Number(studentStats?.active_count ?? 0);
    const totalRegistered = Array.from(trackCounts.values()).reduce((sum, item) => sum + item.total, 0);
    const totalAccepted = Array.from(trackCounts.values()).reduce((sum, item) => sum + item.accepted, 0);
    const totalQuota = 240;
    const remainingSeats = Math.max(0, totalQuota - totalAccepted);

    const tracks = [
      {
        code: 'ZONASI' as const,
        title: 'Jalur Zonasi Domisili',
        quotaPercent: 50,
        capacity: 120,
        registered: trackCounts.get('ZONASI')?.total ?? 0,
        accepted: trackCounts.get('ZONASI')?.accepted ?? 0,
        description:
          'Seleksi berbasis jarak koordinat rumah ke gerbang sekolah (radius maksimal 1.500 meter) dengan validasi Kartu Keluarga.',
        requirements: [
          { label: 'Radius Maksimal', value: '1.500 Meter' },
          { label: 'Dokumen Utama', value: 'KK Minimal 1 Tahun' },
        ],
        ctaLabel: 'Daftar Jalur Zonasi',
      },
      {
        code: 'PRESTASI' as const,
        title: 'Jalur Prestasi Akademik & Non-Akademik',
        quotaPercent: 30,
        capacity: 72,
        registered: trackCounts.get('PRESTASI')?.total ?? 0,
        accepted: trackCounts.get('PRESTASI')?.accepted ?? 0,
        description:
          'Seleksi gabungan nilai rapor semester 1-5 serta sertifikat kejuaraan tingkat kota, provinsi, nasional, atau internasional.',
        requirements: [
          { label: 'Rata-rata Rapor', value: '>= 85.00' },
          { label: 'Sertifikat Lomba', value: 'Maks. 3 Tahun Terakhir' },
        ],
        ctaLabel: 'Daftar Jalur Prestasi',
        recommended: true,
      },
      {
        code: 'AFIRMASI' as const,
        title: 'Jalur Afirmasi KIP / PIP / PKH',
        quotaPercent: 15,
        capacity: 36,
        registered: trackCounts.get('AFIRMASI')?.total ?? 0,
        accepted: trackCounts.get('AFIRMASI')?.accepted ?? 0,
        description:
          'Kesempatan khusus bagi calon peserta didik pemegang kartu KIP, PKH, atau KKS aktif yang terdata pada DTKS Kemensos.',
        requirements: [
          { label: 'Validasi Data', value: 'DTKS / KIP / PKH Aktif' },
          { label: 'Keringanan Biaya', value: 'Pembebasan Dana Pengembangan' },
        ],
        ctaLabel: 'Daftar Jalur Afirmasi',
      },
      {
        code: 'MUTASI' as const,
        title: 'Jalur Perpindahan Tugas Orang Tua',
        quotaPercent: 5,
        capacity: 12,
        registered: trackCounts.get('MUTASI')?.total ?? 0,
        accepted: trackCounts.get('MUTASI')?.accepted ?? 0,
        description:
          'Untuk calon siswa yang mengikuti mutasi penugasan orang tua (ASN/TNI/POLRI/BUMN) atau putra-putri pendidik.',
        requirements: [
          { label: 'Surat Tugas', value: 'SK Mutasi Resmi < 1 Tahun' },
          { label: 'Domisili', value: 'Kota/Kabupaten Tujuan' },
        ],
        ctaLabel: 'Daftar Jalur Mutasi',
      },
    ];

    return {
      schoolName: 'SMA Negeri Nusantara Unggul',
      npsn: '20108923',
      accreditation: 'A (Unggul BAN-SM)',
      wave: {
        title: 'PPDB Online TA 2026/2027 Gelombang 1',
        periodName: periodRow?.name ?? 'TA 2026/2027 Ganjil',
        closingDateLabel: '30 November 2026',
        deadlineIso: '2026-11-30T23:59:59+07:00',
        totalQuota,
        totalRegistered,
        remainingSeats,
      },
      metrics: {
        accreditation: 'A',
        alumniUniversityRate: '98.4%',
        activeStudents,
        totalRegisteredPpdb: totalRegistered,
        serviceUptime: '24/7',
      },
      tracks,
      feeSchedule: [
        { component: 'Biaya Pendaftaran & Seleksi CBT', nominal: 'Gratis (Rp 0)', notes: 'Ditanggung subsidi operasional sekolah' },
        { component: 'Dana Sumbangan Pendidikan (DSP)', nominal: 'Rp 0 - Rp 3.500.000', notes: 'Gratis untuk Jalur Afirmasi KIP/PIP' },
        { component: 'Iuran SPP Bulanan', nominal: 'Rp 250.000 / bulan', notes: 'Pembayaran via Virtual Account & QRIS' },
        { component: 'Atribut, Seragam Khas & Kartu RFID', nominal: 'Rp 850.000', notes: 'Dibayarkan setelah dinyatakan lulus' },
      ],
    };
  }

  async searchPublicResults(params: {
    q?: string;
    highlight?: string;
    track?: string;
    tab?: string;
    page?: number;
    pageSize?: number;
  }) {
    const q = params.q?.trim() ?? '';
    const highlight = params.highlight?.trim() ?? '';
    const track = params.track && params.track !== 'ALL' ? params.track.trim().toUpperCase() : '';
    const tab = params.tab === 'WAITLIST' ? 'WAITLIST' : 'ACCEPTED';
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize ?? 6)));

    const rows = await this.pg.query<{
      id: string;
      registration_number: string;
      nisn: string | null;
      nik: string | null;
      full_name: string;
      previous_school: string | null;
      admission_track: string;
      verification_status: string;
      verification_notes: string | null;
      created_at: Date;
    }>(
      `SELECT a.id, a.registration_number, s.nisn, s.nik, s.full_name,
              a.previous_school, a.admission_track, a.verification_status,
              a.verification_notes, a.created_at
       FROM academic_lms.ppdb_applications a
       JOIN iam_master.students s ON s.id = a.student_id
       ORDER BY a.created_at ASC`,
    );

    const mapped = rows.map((row, idx) => {
      const seedNum = (idx + 1) * 17 + row.full_name.length;
      const distanceMeters = row.admission_track === 'ZONASI' ? 280 + (seedNum % 980) : 1400 + (seedNum % 2500);
      const reportScore = Number((86.5 + ((seedNum % 110) / 10)).toFixed(2));
      const placementScore = Number((84 + (seedNum % 14)).toFixed(2));
      const finalScore = Number((reportScore * 0.6 + placementScore * 0.4).toFixed(2));

      let selectionStatus: 'LULUS UTAMA' | 'CADANGAN PRIORITAS' | 'CADANGAN AKTIF' | 'VERIFIKASI';
      let bucket: 'ACCEPTED' | 'WAITLIST';
      if (['ACCEPTED', 'MIGRATED', 'VERIFIED'].includes(row.verification_status)) {
        selectionStatus = 'LULUS UTAMA';
        bucket = 'ACCEPTED';
      } else if (row.verification_status === 'SUBMITTED') {
        selectionStatus = 'CADANGAN PRIORITAS';
        bucket = 'WAITLIST';
      } else {
        selectionStatus = 'CADANGAN AKTIF';
        bucket = 'WAITLIST';
      }

      const trackLabels: Record<string, string> = {
        ZONASI: 'Zonasi Domisili',
        PRESTASI: 'Prestasi Akademik',
        AFIRMASI: 'Afirmasi KIP/PIP',
        MUTASI: 'Pindah Tugas / Mutasi',
        REGULER: 'Reguler',
      };

      return {
        rank: idx + 1,
        registrationNumber: row.registration_number,
        nisn: row.nisn ?? '-',
        nik: row.nik ?? '-',
        fullName: row.full_name,
        previousSchool: row.previous_school ?? 'SMP Negeri Mitra',
        admissionTrack: row.admission_track,
        trackLabel: trackLabels[row.admission_track] ?? row.admission_track,
        verificationStatus: row.verification_status,
        status: selectionStatus,
        bucket,
        distanceMeters,
        placementScore,
        reportScore,
        finalScore,
        originArea: row.admission_track === 'ZONASI' ? 'Dalam Zonasi Kota' : 'Luar Zonasi',
        schoolAccepted: 'SMA Negeri Nusantara Unggul',
        verifiedAt: new Date(row.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        notes:
          row.verification_notes ??
          (bucket === 'ACCEPTED'
            ? 'Berkas lengkap terverifikasi. Silakan lanjutkan daftar ulang daring.'
            : 'Masuk daftar antrean / verifikasi berkas panitia PPDB.'),
      };
    });

    const sorted = mapped.sort((a, b) => b.finalScore - a.finalScore).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    const acceptedAll = sorted.filter((r) => r.bucket === 'ACCEPTED');
    const waitlistAll = sorted.filter((r) => r.bucket === 'WAITLIST');

    const matchesFilter = (r: (typeof sorted)[number]) => {
      const matchTrack = !track || r.admissionTrack === track;
      const qLower = q.toLowerCase();
      const matchQ =
        !qLower ||
        r.registrationNumber.toLowerCase().includes(qLower) ||
        r.nisn.toLowerCase().includes(qLower) ||
        r.fullName.toLowerCase().includes(qLower);
      return matchTrack && matchQ;
    };

    const activePool = (tab === 'ACCEPTED' ? acceptedAll : waitlistAll).filter(matchesFilter);
    const totalItems = activePool.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const items = activePool.slice((safePage - 1) * pageSize, safePage * pageSize);

    const lookupTerm = highlight || q;
    const highlightedRecord = lookupTerm
      ? sorted.find(
          (r) =>
            (r.registrationNumber.toLowerCase() === lookupTerm.toLowerCase() ||
              r.nisn.toLowerCase() === lookupTerm.toLowerCase() ||
              r.fullName.toLowerCase().includes(lookupTerm.toLowerCase())) &&
            (!track || r.admissionTrack === track),
        ) ?? null
      : acceptedAll[0] ?? sorted[0] ?? null;

    const trackRecap = ['ZONASI', 'PRESTASI', 'AFIRMASI', 'MUTASI'].map((code) => ({
      code,
      acceptedCount: acceptedAll.filter((r) => r.admissionTrack === code).length,
      totalCount: sorted.filter((r) => r.admissionTrack === code).length,
    }));

    return {
      totalRegistered: sorted.length,
      totalAccepted: acceptedAll.length,
      totalWaitlist: waitlistAll.length,
      page: safePage,
      pageSize,
      totalPages,
      totalItems,
      items,
      highlightedRecord,
      trackRecap,
    };
  }

  private assertOwnerOrStaff(ownerUserId: string, actor: AuthenticatedUser): void {
    const isStaff = actor.roles.some((r) =>
      ['SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH'].includes(r),
    );
    if (!isStaff && actor.userId !== ownerUserId) {
      throw new ForbiddenException('You can only manage your own PPDB application');
    }
  }

  private generateRegNumber(): string {
    const year = new Date().getFullYear();
    const rand = crypto.randomInt(100000, 999999);
    return `PPDB-${year}-${rand}`;
  }
}
