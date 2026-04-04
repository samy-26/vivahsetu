import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalBrides,
      totalGrooms,
      pendingApprovals,
      activeSubscriptions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      this.prisma.user.count({ where: { role: 'BRIDE' } }),
      this.prisma.user.count({ where: { role: 'GROOM' } }),
      this.prisma.profile.count({ where: { isApprovedByAdmin: false } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalBrides,
      totalGrooms,
      pendingApprovals,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getPendingProfiles(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where: { isApprovedByAdmin: false },
        skip, take: limit,
        include: {
          user: {
            select: { id: true, email: true, phone: true, role: true, aadhaarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.profile.count({ where: { isApprovedByAdmin: false } }),
    ]);
    return { profiles, total, page, limit };
  }

  async approveProfile(profileId: number, adminId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.profile.update({
      where: { id: profileId },
      data: { isApprovedByAdmin: true, approvedAt: new Date(), approvedBy: adminId },
    });

    await this.prisma.user.update({
      where: { id: profile.userId },
      data: { isApproved: true },
    });

    await this.emailService.sendEmail(
      profile.user.email,
      'Profile Approved - VivahSetu',
      `<h2>Congratulations!</h2><p>Your profile has been approved on VivahSetu. You can now browse and connect with matches.</p>`,
      profile.userId,
    );

    return { message: 'Profile approved successfully' };
  }

  async rejectProfile(profileId: number, reason: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.emailService.sendEmail(
      profile.user.email,
      'Profile Review - VivahSetu',
      `<h2>Profile Update Required</h2><p>Your profile needs some updates: ${reason}</p><p>Please update and resubmit.</p>`,
      profile.userId,
    );

    return { message: 'Rejection notification sent' };
  }

  async getAllPayments(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip, take: limit,
        include: { user: { select: { id: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);
    return { payments, total, page, limit };
  }

  async getAnalytics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newUsers, newPayments, interestsSent, subscriptionsCreated] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.interest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.subscription.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return {
      last30Days: {
        newUsers,
        revenue: newPayments._sum.amount || 0,
        transactions: newPayments._count,
        interestsSent,
        subscriptionsCreated,
      },
    };
  }
}
