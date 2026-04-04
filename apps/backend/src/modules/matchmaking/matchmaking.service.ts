import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchmakingService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: number, page: number = 1, limit: number = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, kundliDetails: true },
    });

    const oppositeRole = user.role === 'BRIDE' ? 'GROOM' : 'BRIDE';

    // Get already interacted profiles to exclude
    const interactions = await this.prisma.interest.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      select: { senderId: true, receiverId: true },
    });
    const excludeIds = new Set<number>([userId]);
    interactions.forEach((i) => {
      excludeIds.add(i.senderId);
      excludeIds.add(i.receiverId);
    });

    const where: any = {
      isApprovedByAdmin: true,
      isActive: true,
      user: { role: oppositeRole, id: { notIn: Array.from(excludeIds) } },
    };

    // Preference-based matching based on age
    if (user.profile) {
      const ageDiff =
        user.role === 'BRIDE'
          ? { gte: user.profile.age - 5, lte: user.profile.age + 10 }
          : { gte: user.profile.age - 10, lte: user.profile.age + 5 };
      where.age = ageDiff;
    }

    const skip = (page - 1) * limit;
    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip, take: limit,
        include: { user: { select: { id: true, role: true, isVerified: true } } },
        orderBy: [{ profileViews: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { profiles, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDashboardStats(userId: number) {
    const [sentInterests, receivedInterests, acceptedMatches, subscription] = await Promise.all([
      this.prisma.interest.count({ where: { senderId: userId } }),
      this.prisma.interest.count({ where: { receiverId: userId } }),
      this.prisma.interest.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
      }),
      this.prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE', endDate: { gt: new Date() } },
      }),
    ]);

    return {
      sentInterests,
      receivedInterests,
      acceptedMatches,
      subscription: subscription
        ? {
            planType: subscription.planType,
            endDate: subscription.endDate,
            remainingViews: subscription.remainingViews,
            status: subscription.status,
          }
        : null,
    };
  }
}
