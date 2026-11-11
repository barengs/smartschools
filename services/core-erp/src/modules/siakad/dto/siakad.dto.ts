import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAcademicPeriodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(['ODD', 'EVEN'])
  semester!: 'ODD' | 'EVEN';

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  weeklyHours?: number;

  @IsOptional()
  @IsBoolean()
  requiresLab?: boolean;
}

export class CreateClassroomDto {
  @IsUUID()
  academicPeriodId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel!: number;

  @IsOptional()
  @IsUUID()
  homeroomTeacherId?: string;

  @IsOptional()
  @IsString()
  roomCode?: string;
}

export class AssignClassroomMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  studentIds!: string[];
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  nis?: string;

  @IsOptional()
  @IsString()
  nisn?: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsIn(['CANDIDATE', 'ACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED'])
  status?: 'CANDIDATE' | 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'DROPPED';

  @IsOptional()
  @IsString()
  dapodikSyncId?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergyNotes?: string;
}

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsString()
  nipNuptk?: string;

  @IsIn(['PNS', 'PPPK', 'PERMANENT', 'HONORER'])
  employmentStatus!: 'PNS' | 'PPPK' | 'PERMANENT' | 'HONORER';

  @IsString()
  @IsNotEmpty()
  position!: string;
}
