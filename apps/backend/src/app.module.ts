import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { InterestsModule } from './modules/interests/interests.module';
import { ChatModule } from './modules/chat/chat.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { KundliModule } from './modules/kundli/kundli.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { BlogModule } from './modules/blog/blog.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    MatchmakingModule,
    InterestsModule,
    ChatModule,
    SubscriptionsModule,
    PaymentsModule,
    KundliModule,
    PdfModule,
    NotificationsModule,
    EmailModule,
    BlogModule,
    GalleryModule,
    AdminModule,
    StorageModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
