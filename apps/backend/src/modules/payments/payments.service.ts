import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EmailService } from '../email/email.service';

const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  private razorpay: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
    private emailService: EmailService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: number, amount: number, purpose: string, metadata?: any) {
    const amountPaisa = Math.round(amount * 100);

    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountPaisa,
      currency: 'INR',
      receipt: `vivahsetu_${userId}_${Date.now()}`,
      notes: { userId: userId.toString(), purpose },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
        purpose,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: amountPaisa,
      currency: 'INR',
      keyId: this.configService.get('RAZORPAY_KEY_ID'),
      paymentId: payment.id,
    };
  }

  async verifyPayment(
    userId: number,
    dto: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    const body = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { razorpayOrderId: dto.razorpayOrderId, userId },
    });
    if (!payment) throw new BadRequestException('Payment not found');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpaySignature: dto.razorpaySignature,
        status: 'SUCCESS',
      },
    });

    // Handle post-payment actions
    if (payment.purpose === 'subscription') {
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      await this.subscriptionsService.createSubscription(userId, metadata.planType, payment.id);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.emailService.sendPaymentConfirmation(user.email, payment.amount, payment.purpose);

    return { success: true, paymentId: payment.id };
  }

  async handleWebhook(signature: string, body: any) {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Webhook received: ${body.event}`);
    return { received: true };
  }

  async getPaymentHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);
    return { payments, total, page, limit };
  }
}
