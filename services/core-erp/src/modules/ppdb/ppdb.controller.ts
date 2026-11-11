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
import { CurrentUser } from '../iam/decorators/current-user.decorator';
import { Roles } from '../iam/decorators/roles.decorator';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { AuthenticatedUser } from '../iam/iam.types';
import {
  AttachPpdbDocumentDto,
  MigratePpdbDto,
  PresignPpdbDocumentDto,
  RegisterPpdbDto,
  VerifyPpdbDto,
} from './dto/ppdb.dto';
import { PpdbService } from './ppdb.service';

@Controller('ppdb')
export class PpdbController {
  constructor(private readonly ppdbService: PpdbService) {}

  @Post('register')
  register(@Body() dto: RegisterPpdbDto) {
    return this.ppdbService.register(dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  myApplication(@CurrentUser() user: AuthenticatedUser) {
    return this.ppdbService.getMyApplication(user.userId);
  }

  @Post(':id/documents/presign')
  @UseGuards(JwtAuthGuard)
  presignDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PresignPpdbDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ppdbService.presignDocument(id, dto, user);
  }

  @Post(':id/documents')
  @UseGuards(JwtAuthGuard)
  attachDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AttachPpdbDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ppdbService.attachDocument(id, dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH')
  list(@Query('status') status?: string) {
    return this.ppdbService.listApplications(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'STAF_TU', 'KEPALA_SEKOLAH')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.ppdbService.getApplicationById(id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'STAF_TU')
  verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPpdbDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ppdbService.verifyApplication(id, dto, user.userId);
  }

  @Post(':id/migrate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'STAF_TU')
  migrate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MigratePpdbDto,
  ) {
    return this.ppdbService.oneClickMigrate(id, dto);
  }
}

