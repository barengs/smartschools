import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export const BILLING_TYPES = [
  'PPDB_FEE',
  'SPP',
  'BUILDING_FEE',
  'EXAM_FEE',
  'OTHER',
] as const;

export class CreateInvoiceDto {
  @IsUUID()
  studentId!: string;

  @IsIn([...BILLING_TYPES])
  billingType!: (typeof BILLING_TYPES)[number];

  @IsInt()
  @Min(1000)
  amount!: number;

  @IsDateString()
  dueDate!: string;
}

export class BulkGenerateSppDto {
  @IsInt()
  @Min(1000)
  amount!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsUUID()
  classroomId?: string;
}

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @IsInt()
  @Min(1)
  paidAmount!: number;

  @IsIn(['PAID', 'EXPIRED'])
  paymentStatus!: 'PAID' | 'EXPIRED';

  @IsOptional()
  @IsString()
  externalReference?: string;
}
