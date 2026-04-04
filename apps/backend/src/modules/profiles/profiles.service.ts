import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchProfilesDto } from './dto/search-profiles.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: number, dto: CreateProfileDto) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: { ...dto, userId },
      update: dto,
    });
  }

  async getMyProfile(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: { familyDetails: true, kundliDetails: true },
        },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getProfileById(id: number, viewerId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, role: true, isVerified: true, createdAt: true,
            familyDetails: true, kundliDetails: true,
          },
        },
      },
    });
    if (!profile || !profile.isApprovedByAdmin) throw new NotFoundException('Profile not found');

    // Track page view (not a contact view)
    await this.prisma.profile.update({ where: { id }, data: { profileViews: { increment: 1 } } });

    // Check whether the viewer has a subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: viewerId, status: 'ACTIVE', endDate: { gt: new Date() }, remainingViews: { gt: 0 } },
    });

    // Check if viewer has already viewed this contact before
    const existingView = await this.prisma.contactView.findUnique({
      where: { viewerId_profileId: { viewerId, profileId: id } },
    });

    return {
      ...profile,
      contactHidden: !existingView,
      hasSubscription: subscription !== null,
      remainingViews: subscription?.remainingViews ?? 0,
      // If already viewed, embed the stored contact details directly
      revealedContact: existingView
        ? { email: existingView.email, phone: existingView.phone }
        : null,
    };
  }

  async viewContact(profileId: number, viewerId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, email: true, phone: true, role: true, isVerified: true } },
      },
    });
    if (!profile || !profile.isApprovedByAdmin) throw new NotFoundException('Profile not found');

    // If already viewed before, return stored contact — no decrement
    const existing = await this.prisma.contactView.findUnique({
      where: { viewerId_profileId: { viewerId, profileId } },
    });
    if (existing) {
      return {
        contactRevealed: true,
        email: existing.email,
        phone: existing.phone,
        alreadyViewed: true,
        remainingViews: null, // no change
      };
    }

    // First time — require active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: viewerId, status: 'ACTIVE', endDate: { gt: new Date() }, remainingViews: { gt: 0 } },
    });
    if (!subscription) {
      return { contactRevealed: false, reason: 'no_subscription' };
    }

    // Decrement one view and record the contact view atomically
    const [updatedSub] = await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { remainingViews: { decrement: 1 } },
      }),
      this.prisma.contactView.create({
        data: {
          viewerId,
          profileId,
          email: profile.user.email,
          phone: profile.user.phone ?? '',
        },
      }),
    ]);

    return {
      contactRevealed: true,
      email: profile.user.email,
      phone: profile.user.phone,
      alreadyViewed: false,
      remainingViews: updatedSub.remainingViews,
    };
  }

  async getContactHistory(viewerId: number) {
    return this.prisma.contactView.findMany({
      where: { viewerId },
      include: {
        profile: {
          select: {
            id: true, name: true, age: true, city: true, state: true,
            profession: true, photos: true,
            user: { select: { role: true, isVerified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchProfiles(viewerId: number, dto: SearchProfilesDto) {
    const viewer = await this.prisma.user.findUnique({ where: { id: viewerId } });
    const oppositeRole = viewer.role === 'BRIDE' ? 'GROOM' : 'BRIDE';

    const where: any = {
      isApprovedByAdmin: true,
      isActive: true,
      user: { role: oppositeRole },
    };

    if (dto.minAge || dto.maxAge) where.age = {};
    if (dto.minAge) where.age.gte = dto.minAge;
    if (dto.maxAge) where.age.lte = dto.maxAge;
    if (dto.city) where.city = { contains: dto.city };
    if (dto.state) where.state = { contains: dto.state };
    if (dto.country) where.country = dto.country;
    if (dto.gotra) where.gotra = { contains: dto.gotra };
    if (dto.maritalStatus) where.maritalStatus = dto.maritalStatus;
    if (dto.education) where.education = { contains: dto.education };
    if (dto.profession) where.profession = { contains: dto.profession };

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, role: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { profiles, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.profile.update({ where: { userId }, data: dto });
  }

  async uploadPhotos(userId: number, photoUrls: string[]) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const existing = profile.photos ? JSON.parse(profile.photos) : [];
    const updated = [...existing, ...photoUrls];
    return this.prisma.profile.update({
      where: { userId },
      data: { photos: JSON.stringify(updated) },
    });
  }

  async getFamilyDetails(userId: number) {
    return this.prisma.familyDetails.findUnique({ where: { userId } });
  }

  async upsertFamilyDetails(userId: number, data: any) {
    return this.prisma.familyDetails.upsert({
      where: { userId },
      create: { ...data, userId },
      update: data,
    });
  }
}
