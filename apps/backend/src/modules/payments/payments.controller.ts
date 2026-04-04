import { Controller, Post, Get, Body, Headers, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order' })
  async createOrder(
    @CurrentUser('id') userId: number,
    @Body() body: { amount: number; purpose: string; metadata?: any },
  ) {
    return this.paymentsService.createOrder(userId, body.amount, body.purpose, body.metadata);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment after completion' })
  async verifyPayment(@CurrentUser('id') userId: number, @Body() dto: any) {
    return this.paymentsService.verifyPayment(userId, dto);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(signature, body);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@CurrentUser('id') userId: number, @Query() pagination: PaginationDto) {
    return this.paymentsService.getPaymentHistory(userId, pagination.page, pagination.limit);
  }
}
