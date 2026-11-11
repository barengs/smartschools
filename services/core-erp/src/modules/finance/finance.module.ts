import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [IamModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
