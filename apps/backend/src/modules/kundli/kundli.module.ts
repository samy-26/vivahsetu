import { Module } from '@nestjs/common';
import { KundliController } from './kundli.controller';
import { KundliService } from './kundli.service';
import { PdfModule } from '../pdf/pdf.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PdfModule, PaymentsModule, EmailModule],
  controllers: [KundliController],
  providers: [KundliService],
  exports: [KundliService],
})
export class KundliModule {}
