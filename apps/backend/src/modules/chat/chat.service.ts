import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async canChat(userId: number, partnerId: number): Promise<boolean> {
    const interest = await this.prisma.interest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId, status: 'ACCEPTED' },
          { senderId: partnerId, receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });
    return interest !== null;
  }

  async sendMessage(senderId: number, receiverId: number, message: string) {
    const canChat = await this.canChat(senderId, receiverId);
    if (!canChat) throw new ForbiddenException('Chat not allowed. Interest must be accepted first.');

    return this.prisma.chat.create({
      data: { senderId, receiverId, message },
    });
  }

  async getConversation(userId: number, partnerId: number, page: number, limit: number) {
    const canChat = await this.canChat(userId, partnerId);
    if (!canChat) throw new ForbiddenException('Chat not allowed');

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.chat.count({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark as read
    await this.prisma.chat.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return { messages: messages.reverse(), total, page, limit };
  }

  async getConversationList(userId: number) {
    const messages = await this.prisma.chat.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationsMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partner: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.receiverId === userId) {
        const c = conversationsMap.get(partnerId);
        c.unreadCount++;
      }
    }

    return Array.from(conversationsMap.values());
  }
}
