import {
  Controller, Get, Post, Put, Body, Param, ParseIntPipe,
  UseGuards, Query, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchProfilesDto } from './dto/search-profiles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'profiles', version: '1' })
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update my profile' })
  async createProfile(@CurrentUser('id') userId: number, @Body() dto: CreateProfileDto) {
    return this.profilesService.createProfile(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(@CurrentUser('id') userId: number) {
    return this.profilesService.getMyProfile(userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search profiles with filters' })
  async searchProfiles(@CurrentUser('id') userId: number, @Query() dto: SearchProfilesDto) {
    return this.profilesService.searchProfiles(userId, dto);
  }

  // Static routes MUST come before /:id to avoid being caught by ParseIntPipe
  @Get('contact-history')
  @ApiOperation({ summary: 'Get all profiles whose contact I have viewed' })
  async getContactHistory(@CurrentUser('id') userId: number) {
    return this.profilesService.getContactHistory(userId);
  }

  @Get('family/me')
  @ApiOperation({ summary: 'Get my family details' })
  async getFamilyDetails(@CurrentUser('id') userId: number) {
    return this.profilesService.getFamilyDetails(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a profile by ID' })
  async getProfile(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.profilesService.getProfileById(id, userId);
  }

  @Post(':id/contact')
  @HttpCode(200)
  @ApiOperation({ summary: 'View contact details of a profile (uses 1 subscription view)' })
  async viewContact(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.profilesService.viewContact(id, userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my profile' })
  async updateProfile(@CurrentUser('id') userId: number, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(userId, dto);
  }

  @Post('family')
  @ApiOperation({ summary: 'Create/update family details' })
  async upsertFamily(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.profilesService.upsertFamilyDetails(userId, data);
  }
}
