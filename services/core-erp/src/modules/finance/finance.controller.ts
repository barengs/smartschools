import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../iam/decorators/roles.decorator';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import {
  BulkGenerateSppDto,
  CreateInvoiceDto,
  PaymentWebhookDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('finance/invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'BENDAHARA', 'KEPALA_SEKOLAH', 'STAF_TU')
  listInvoices(
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.financeService.listInvoices(status, studentId);
  }

  @Post('finance/invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'BENDAHARA')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Post('finance/invoices/bulk-spp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'BENDAHARA')
  bulkGenerateSpp(@Body() dto: BulkGenerateSppDto) {
    return this.financeService.bulkGenerateSpp(dto);
  }

  @Get('finance/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'BENDAHARA', 'KEPALA_SEKOLAH')
  summary() {
    return this.financeService.getSummary();
  }

  @Post('webhooks/payment')
  paymentWebhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-webhook-signature') signatureHeader?: string,
  ) {
    return this.financeService.handlePaymentWebhook(dto, signatureHeader);
  }
}

