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
