import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, userId?: number) {
    // Send directly — no queue needed
    await this.sendDirectEmail(to, subject, html);
    if (userId) {
      await this.logEmail(userId, to, subject, 'sent').catch(() => {});
    }
  }

  async sendDirectEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"VivahSetu" <${this.configService.get('SMTP_USER')}>`,
        to, subject, html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (err) {
      this.logger.warn(`Email send skipped (SMTP not configured): ${to}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC3322;">Welcome to VivahSetu!</h1>
        <p>Dear ${name},</p>
        <p>Welcome to VivahSetu - your trusted Brahmana matrimonial platform.</p>
        <p>Complete your profile to start your matchmaking journey.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/dashboard"
           style="background:#CC3322;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
          Complete Profile
        </a>
        <p>Best regards,<br/>Team VivahSetu</p>
      </div>
    `;
    return this.sendEmail(to, 'Welcome to VivahSetu!', html);
  }

  async sendOtpEmail(to: string, otp: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #CC3322;">Your OTP for VivahSetu</h2>
        <p>Your one-time password is:</p>
        <div style="background:#f8f8f8;border:2px solid #CC3322;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#CC3322;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <p>Team VivahSetu</p>
      </div>
    `;
    return this.sendDirectEmail(to, 'Your VivahSetu OTP', html);
  }

  async sendPaymentConfirmation(to: string, amount: number, purpose: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Payment Successful!</h2>
        <p>Thank you for your payment of <strong>&#8377;${amount}</strong> for <strong>${purpose}</strong>.</p>
        <p>Your account has been updated. You can now enjoy premium features.</p>
        <p>Team VivahSetu</p>
      </div>
    `;
    return this.sendEmail(to, 'Payment Confirmation - VivahSetu', html);
  }

  async sendPdfDownloadEmail(to: string, name: string, downloadUrl: string, type: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #CC3322;">Your ${type} is Ready!</h2>
        <p>Dear ${name},</p>
        <p>Your ${type} has been generated and is ready for download.</p>
        <a href="${downloadUrl}"
           style="background:#CC3322;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
          Download ${type}
        </a>
        <p>This link is valid for 24 hours.</p>
        <p>Team VivahSetu</p>
      </div>
    `;
    return this.sendEmail(to, `Your ${type} - VivahSetu`, html);
  }

  async logEmail(userId: number, to: string, subject: string, status: string, template?: string) {
    return this.prisma.emailLog.create({
      data: { userId, to, subject, status, template },
    });
  }

  async getEmailLogs(userId?: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};
    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.emailLog.count({ where }),
    ]);
    return { logs, total, page, limit };
  }
}
