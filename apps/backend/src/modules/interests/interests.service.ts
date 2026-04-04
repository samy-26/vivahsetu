import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InterestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async sendInterest(senderId: number, receiverId: number, message?: string) {
    const existing = await this.prisma.interest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
    if (existing) throw new ConflictException('Interest already sent');

    const interest = await this.prisma.interest.create({
      data: { senderId, receiverId, message },
    });

    await this.notificationsService.create(receiverId, {
      title: 'New Interest Received',
      message: 'Someone has shown interest in your profile',
      type: 'interest',
      data: JSON.stringify({ interestId: interest.id, senderId }),
    });

    return interest;
  }

  async respondToInterest(userId: number, interestId: number, status: 'ACCEPTED' | 'REJECTED') {
    const interest = await this.prisma.interest.findUnique({ where: { id: interestId } });
    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.receiverId !== userId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.interest.update({
      where: { id: interestId },
      data: { status },
    });

    await this.notificationsService.create(interest.senderId, {
      title: `Interest ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`,
      message: `Your interest has been ${status.toLowerCase()}`,
      type: 'interest_response',
      data: JSON.stringify({ interestId, status }),
    });

    return updated;
  }

  async getSentInterests(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [interests, total] = await Promise.all([
      this.prisma.interest.findMany({
        where: { senderId: userId },
        skip, take: limit,
        include: { receiver: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.interest.count({ where: { senderId: userId } }),
    ]);
    return { interests, total, page, limit };
  }

  async getReceivedInterests(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [interests, total] = await Promise.all([
      this.prisma.interest.findMany({
        where: { receiverId: userId },
        skip, take: limit,
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.interest.count({ where: { receiverId: userId } }),
    ]);
    return { interests, total, page, limit };
  }

  async getAcceptedMatches(userId: number) {
    return this.prisma.interest.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });
  }
}
