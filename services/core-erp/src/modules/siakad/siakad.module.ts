import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { SiakadController } from './siakad.controller';
import { SiakadService } from './siakad.service';

@Module({
  imports: [IamModule],
  controllers: [SiakadController],
  providers: [SiakadService],
})
export class SiakadModule {}
