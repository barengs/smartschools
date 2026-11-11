import * as crypto from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loadAppConfig } from '../../config/env.config';
import { PgService } from '../../database/pg.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  BulkGenerateSppDto,
  CreateInvoiceDto,
  PaymentWebhookDto,
} from './dto/finance.dto';

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  student_id: string;
  student_name?: string;
  nis?: string | null;
  billing_type: string;
  amount: string;
  due_date: string;
  status: string;
  va_number: string | null;
  qris_string: string | null;
  paid_at: Date | null;
  created_at: Date;
}

@Injectable()
export class FinanceService {
  private readonly cfg = loadAppConfig();

  constructor(
    private readonly pg: PgService,
    private readonly notifications: NotificationsService,
  ) {}

  listInvoices(status?: string, studentId?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      conditions.push(`i.status = $${params.length}`);
    }
    if (studentId) {
      params.push(studentId);
      conditions.push(`i.student_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.pg.query<InvoiceRow>(
      `SELECT i.id, i.invoice_number, i.student_id, s.full_name AS student_name, s.nis,
              i.billing_type, i.amount, i.due_date, i.status, i.va_number, i.qris_string,
              i.paid_at, i.created_at
       FROM finance_analytics.invoices i
       JOIN iam_master.students s ON s.id = i.student_id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT 300`,
      params,
    );
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceNumber = this.generateInvoiceNumber(dto.billingType);
    const vaNumber = `8808${crypto.randomInt(1000000000, 9999999999)}`;
    const qrisString = `000201010212SMARTSCHOOL.${invoiceNumber}`;

    return this.pg.queryOne<InvoiceRow>(
      `INSERT INTO finance_analytics.invoices
         (invoice_number, student_id, billing_type, amount, due_date, status, va_number, qris_string)
       VALUES ($1, $2, $3, $4, $5, 'UNPAID', $6, $7)
       RETURNING id, invoice_number, student_id, billing_type, amount, due_date, status, va_number, qris_string, paid_at, created_at`,
      [
        invoiceNumber,
        dto.studentId,
        dto.billingType,
        dto.amount,
        dto.dueDate,
        vaNumber,
        qrisString,
      ],
    );
  }

  async bulkGenerateSpp(dto: BulkGenerateSppDto) {
    return this.pg.withTransaction(async (client) => {
      const studentsRes = dto.classroomId
        ? await client.query<{ id: string }>(
            `SELECT s.id
             FROM academic_lms.classroom_members cm
             JOIN iam_master.students s ON s.id = cm.student_id
             WHERE cm.classroom_id = $1 AND s.status = 'ACTIVE'`,
            [dto.classroomId],
          )
        : await client.query<{ id: string }>(
            `SELECT id FROM iam_master.students WHERE status = 'ACTIVE'`,
          );

      let createdCount = 0;
      for (const student of studentsRes.rows) {
        const invNum = this.generateInvoiceNumber('SPP');
        const vaNum = `8808${crypto.randomInt(1000000000, 9999999999)}`;
        await client.query(
          `INSERT INTO finance_analytics.invoices
             (invoice_number, student_id, billing_type, amount, due_date, status, va_number)
           VALUES ($1, $2, 'SPP', $3, $4, 'UNPAID', $5)`,
          [invNum, student.id, dto.amount, dto.dueDate, vaNum],
        );
        createdCount += 1;
      }

      return { generatedCount: createdCount, billingType: 'SPP', dueDate: dto.dueDate };
    });
  }

  verifyWebhookSignature(rawPayload: unknown, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) {
      return false;
    }
    const expected = crypto
      .createHmac('sha256', this.cfg.paymentWebhookSecret)
      .update(JSON.stringify(rawPayload))
      .digest('hex');

    const bufExpected = Buffer.from(expected, 'utf8');
    const bufActual = Buffer.from(signatureHeader.trim(), 'utf8');
    if (bufExpected.length !== bufActual.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufExpected, bufActual);
  }

  async handlePaymentWebhook(dto: PaymentWebhookDto, signatureHeader: string | undefined) {
    if (!this.verifyWebhookSignature(dto, signatureHeader)) {
      throw new UnauthorizedException('Invalid payment webhook HMAC signature');
    }

    const result = await this.pg.withTransaction(async (client) => {
      const invRes = await client.query<InvoiceRow>(
        `SELECT id, invoice_number, student_id, billing_type, amount, status, paid_at
         FROM finance_analytics.invoices
         WHERE invoice_number = $1
         FOR UPDATE`,
        [dto.invoiceNumber],
      );

      if (invRes.rows.length === 0) {
        throw new NotFoundException('Invoice not found');
      }

      const invoice = invRes.rows[0];
      // Idempotency guard: ignore duplicate PAID callbacks
      if (invoice.status === 'PAID') {
        return {
          invoiceNumber: invoice.invoice_number,
          status: invoice.status,
          alreadyProcessed: true,
        };
      }

      if (dto.paymentStatus === 'PAID' && Number(invoice.amount) !== dto.paidAmount) {
        throw new BadRequestException(
          `Paid amount mismatch: expected ${invoice.amount}, received ${dto.paidAmount}`,
        );
      }

      const nextStatus = dto.paymentStatus === 'PAID' ? 'PAID' : 'EXPIRED';
      const paidAtSql = nextStatus === 'PAID' ? 'NOW()' : 'NULL';

      await client.query(
        `UPDATE finance_analytics.invoices
         SET status = $2, paid_at = ${paidAtSql}
         WHERE id = $1`,
        [invoice.id, nextStatus],
      );

      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        studentId: invoice.student_id,
        amount: Number(invoice.amount),
        status: nextStatus,
        alreadyProcessed: false,
      };
    });

    if (!result.alreadyProcessed && result.status === 'PAID') {
      await this.notifications.publishDomainEvent('InvoicePaid', {
        invoiceId: result.invoiceId,
        invoiceNumber: result.invoiceNumber,
        studentId: result.studentId,
        amount: result.amount,
      });
    }

    return result;
  }

  async getSummary() {
    const totals = await this.pg.queryOne<{
      total_billed: string;
      total_paid: string;
      total_unpaid: string;
      invoice_count: string;
    }>(
      `SELECT COALESCE(SUM(amount), 0) AS total_billed,
              COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS total_paid,
              COALESCE(SUM(amount) FILTER (WHERE status = 'UNPAID'), 0) AS total_unpaid,
              COUNT(*) AS invoice_count
       FROM finance_analytics.invoices`,
    );

    const byType = await this.pg.query(
      `SELECT billing_type,
              COUNT(*) AS count,
              COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS paid_amount,
              COALESCE(SUM(amount) FILTER (WHERE status = 'UNPAID'), 0) AS unpaid_amount
       FROM finance_analytics.invoices
       GROUP BY billing_type
       ORDER BY billing_type ASC`,
    );

    return { totals, byType };
  }

  private generateInvoiceNumber(billingType: string): string {
    return `INV-${billingType}-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
  }
}

