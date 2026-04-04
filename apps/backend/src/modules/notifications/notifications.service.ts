import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { title: string; message: string; type: string; data?: string }) {
    return this.prisma.notification.create({
      data: { userId, ...data },
    });
  }

  async getMyNotifications(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unread, page, limit };
  }

  async markAsRead(userId: number, notificationId?: number) {
    if (notificationId) {
      return this.prisma.notification.update({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
    }
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
