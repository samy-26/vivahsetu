import {
  Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('profiles/pending')
  @ApiOperation({ summary: 'Get profiles pending approval' })
  async getPendingProfiles(@Query() pagination: PaginationDto) {
    return this.adminService.getPendingProfiles(pagination.page, pagination.limit);
  }

  @Post('profiles/:id/approve')
  @ApiOperation({ summary: 'Approve a profile' })
  async approveProfile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
  ) {
    return this.adminService.approveProfile(id, adminId);
  }

  @Post('profiles/:id/reject')
  @ApiOperation({ summary: 'Reject a profile with reason' })
  async rejectProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectProfile(id, reason);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  async getAllPayments(@Query() pagination: PaginationDto) {
    return this.adminService.getAllPayments(pagination.page, pagination.limit);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
