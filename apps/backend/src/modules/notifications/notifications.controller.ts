import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async getNotifications(@CurrentUser('id') userId: number, @Query() pagination: PaginationDto) {
    return this.notificationsService.getMyNotifications(userId, pagination.page, pagination.limit);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(userId, id);
  }
}
