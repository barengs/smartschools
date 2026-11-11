import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../iam/decorators/roles.decorator';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import {
  AssignClassroomMembersDto,
  CreateAcademicPeriodDto,
  CreateClassroomDto,
  CreateSubjectDto,
  CreateTeacherDto,
  UpdateStudentDto,
} from './dto/siakad.dto';
import { SiakadService } from './siakad.service';

@Controller('siakad')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiakadController {
  constructor(private readonly siakadService: SiakadService) {}

  @Get('periods')
  listPeriods() {
    return this.siakadService.listPeriods();
  }

  @Post('periods')
  @Roles('SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU')
  createPeriod(@Body() dto: CreateAcademicPeriodDto) {
    return this.siakadService.createPeriod(dto);
  }

  @Patch('periods/:id/activate')
  @Roles('SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU')
  activatePeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.siakadService.activatePeriod(id);
  }

  @Get('subjects')
  listSubjects() {
    return this.siakadService.listSubjects();
  }

  @Post('subjects')
  @Roles('SUPER_ADMIN', 'WAKA_KURIKULUM')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.siakadService.createSubject(dto);
  }

  @Get('classrooms')
  listClassrooms(@Query('academicPeriodId') academicPeriodId?: string) {
    return this.siakadService.listClassrooms(academicPeriodId);
  }

  @Post('classrooms')
  @Roles('SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU')
  createClassroom(@Body() dto: CreateClassroomDto) {
    return this.siakadService.createClassroom(dto);
  }

  @Get('classrooms/:id/students')
  listClassroomStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.siakadService.listClassroomStudents(id);
  }

  @Post('classrooms/:id/students')
  @Roles('SUPER_ADMIN', 'WAKA_KURIKULUM', 'STAF_TU')
  assignClassroomMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignClassroomMembersDto,
  ) {
    return this.siakadService.assignClassroomMembers(id, dto.studentIds);
  }

  @Get('students')
  @Roles('SUPER_ADMIN', 'KEPALA_SEKOLAH', 'WAKA_KURIKULUM', 'STAF_TU', 'GURU', 'GURU_BK')
  listStudents(@Query('status') status?: string, @Query('q') search?: string) {
    return this.siakadService.listStudents(status, search);
  }

  @Patch('students/:id')
  @Roles('SUPER_ADMIN', 'STAF_TU')
  updateStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.siakadService.updateStudent(id, dto);
  }

  @Get('students/export/dapodik')
  @Roles('SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH')
  exportDapodik() {
    return this.siakadService.exportDapodikReady();
  }

  @Get('teachers')
  @Roles('SUPER_ADMIN', 'KEPALA_SEKOLAH', 'WAKA_KURIKULUM', 'STAF_TU')
  listTeachers() {
    return this.siakadService.listTeachers();
  }

  @Post('teachers')
  @Roles('SUPER_ADMIN', 'STAF_TU')
  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.siakadService.createTeacher(dto);
  }
}
