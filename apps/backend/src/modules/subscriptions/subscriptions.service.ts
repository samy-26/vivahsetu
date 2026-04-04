import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async getPlans() {
    return [
      {
        id: 'BASIC',
        name: 'Basic Plan',
        price: 500,
        duration: '1 Month',
        durationDays: 30,
        views: 10,
        features: [
          '10 profile views/month',
          'Send interests',
          'Basic chat',
          'Email support',
        ],
      },
      {
        id: 'STANDARD',
        name: 'Standard Plan',
        price: 1500,
        duration: '6 Months',
        durationDays: 180,
        views: 50,
        features: [
          '50 contact views',
          '6 months validity',
          'Priority listing',
          'Chat access',
          'Phone support',
        ],
      },
      {
        id: 'PLATINUM',
        name: 'Platinum Plan',
        price: 2000,
        duration: 'Lifetime',
        durationDays: 36500,
        views: 60,
        features: [
          '60 contact views',
          'Lifetime validity',
          'Top priority listing',
          'Unlimited chat',
          'Dedicated support',
          'Kundli discounts',
        ],
      },
    ];
  }

  async getMySubscription(userId: number) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(
    userId: number,
    planType: 'BASIC' | 'STANDARD' | 'PLATINUM',
    paymentId?: number,
  ) {
    const planConfig = {
      BASIC: { views: 10, days: 30 },
      STANDARD: { views: 50, days: 180 },
      PLATINUM: { views: 60, days: 36500 },
    };

    const plan = planConfig[planType];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.days);

    // Expire existing subscriptions
    await this.prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    return this.prisma.subscription.create({
      data: {
        userId,
        planType,
        endDate,
        remainingViews: plan.views,
        status: 'ACTIVE',
        paymentId,
      },
    });
  }

  async getSubscriptionHistory(userId: number) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkAndDecrementViews(userId: number): Promise<boolean> {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        remainingViews: { gt: 0 },
      },
    });
    if (!sub) return false;
    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { remainingViews: { decrement: 1 } },
    });
    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    const expired = await this.prisma.subscription.updateMany({
      where: { status: 'ACTIVE', endDate: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    this.logger.log(`Expired ${expired.count} subscriptions`);
  }
}
