import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export const ADMISSION_TRACKS = [
  'ZONASI',
  'PRESTASI',
  'AFIRMASI',
  'MUTASI',
  'REGULER',
] as const;

export const DOCUMENT_TYPES = [
  'KK',
  'AKTA',
  'IJAZAH',
  'RAPOR',
  'PHOTO',
  'OTHER',
] as const;

export class RegisterPpdbDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsString()
  @MinLength(4)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  nisn?: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsIn(['MALE', 'FEMALE'])
  gender!: 'MALE' | 'FEMALE';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergyNotes?: string;

  @IsIn([...ADMISSION_TRACKS])
  admissionTrack!: (typeof ADMISSION_TRACKS)[number];

  @IsOptional()
  @IsString()
  previousSchool?: string;

  @IsString()
  @IsNotEmpty()
  parentName!: string;

  @IsString()
  @IsNotEmpty()
  parentPhone!: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsUUID()
  academicPeriodId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ppdbFeeAmount?: number;
}

export class PresignPpdbDocumentDto {
  @IsIn([...DOCUMENT_TYPES])
  documentType!: (typeof DOCUMENT_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  fileName!: string;
}

export class AttachPpdbDocumentDto {
  @IsIn([...DOCUMENT_TYPES])
  documentType!: (typeof DOCUMENT_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;
}

export class VerifyPpdbDto {
  @IsIn(['VERIFIED', 'ACCEPTED', 'REJECTED'])
  status!: 'VERIFIED' | 'ACCEPTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MigratePpdbDto {
  @IsOptional()
  @IsString()
  nis?: string;

  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @IsOptional()
  @IsString()
  rfidUid?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailySpendingLimit?: number;
}

