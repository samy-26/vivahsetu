import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, familyDetails: true, kundliDetails: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, otpSecret, ...safe } = user;
    return safe;
  }

  async update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async uploadAadhaar(userId: number, aadhaarNumber: string, aadhaarUrl: string) {
    const encrypted = CryptoJS.AES.encrypt(
      aadhaarNumber,
      process.env.AADHAAR_ENCRYPTION_KEY || 'vivahsetu-key',
    ).toString();

    return this.prisma.user.update({
      where: { id: userId },
      data: { aadhaarNumber: encrypted, aadhaarUrl, isVerified: false },
    });
  }

  async getDecryptedAadhaar(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.aadhaarNumber) return null;
    const bytes = CryptoJS.AES.decrypt(
      user.aadhaarNumber,
      process.env.AADHAAR_ENCRYPTION_KEY || 'vivahsetu-key',
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getAllUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    const where = role ? { role: role as any } : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users: users.map(({ password, otpSecret, ...u }) => u), total, page, limit };
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
