import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { ALLOWED_BUCKETS, StorageService } from './storage.service';

class PresignStorageDto {
  @IsIn([...ALLOWED_BUCKETS])
  bucket!: string;

  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  expiresInSeconds?: number;
}

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign-upload')
  presignUpload(@Body() dto: PresignStorageDto) {
    return this.storageService.presignUpload(
      dto.bucket,
      dto.objectKey,
      dto.expiresInSeconds ?? 900,
    );
  }

  @Post('presign-download')
  presignDownload(@Body() dto: PresignStorageDto) {
    return this.storageService.presignDownload(
      dto.bucket,
      dto.objectKey,
      dto.expiresInSeconds ?? 300,
    );
  }
}

