import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) throw new ConflictException('Email or phone already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        role: dto.role,
      },
    });

    await this.emailService.sendWelcomeEmail(user.email, user.email.split('@')[0]);

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { phone: dto.identifier }] },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password) throw new UnauthorizedException('Please use OTP login');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async sendOtp(dto: SendOtpDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpLog.create({
      data: { target: dto.target, type: dto.type, otp, expiresAt },
    });

    if (dto.type === 'email') {
      await this.emailService.sendOtpEmail(dto.target, otp);
    }
    this.logger.log(`OTP sent to ${dto.target}`);
    return { message: 'OTP sent successfully', expiresIn: 600 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpLog = await this.prisma.otpLog.findFirst({
      where: {
        target: dto.target,
        otp: dto.otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpLog) throw new BadRequestException('Invalid or expired OTP');

    await this.prisma.otpLog.update({ where: { id: otpLog.id }, data: { isUsed: true } });

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.target },
          { phone: dto.target },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.target.includes('@') ? dto.target : `${dto.target}@vivahsetu.com`,
          phone: dto.target.includes('@') ? '' : dto.target,
          isVerified: true,
          role: 'BRIDE',
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, lastLogin: new Date() },
      });
    }

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      const tokens = this.generateTokens(user);
      return { user: this.sanitizeUser(user), ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret'),
        expiresIn: '30d',
      }),
    };
  }

  private sanitizeUser(user: any) {
    const { password, otpSecret, ...safe } = user;
    return safe;
  }
}
