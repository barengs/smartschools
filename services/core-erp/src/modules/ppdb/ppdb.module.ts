import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';

@Module({
  imports: [IamModule],
  controllers: [PpdbController],
  providers: [PpdbService],
})
export class PpdbModule {}

