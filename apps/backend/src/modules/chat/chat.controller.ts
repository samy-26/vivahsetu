import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post(':partnerId')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @CurrentUser('id') userId: number,
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @Body('message') message: string,
  ) {
    return this.chatService.sendMessage(userId, partnerId, message);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversation list' })
  async getConversations(@CurrentUser('id') userId: number) {
    return this.chatService.getConversationList(userId);
  }

  @Get(':partnerId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  async getConversation(
    @CurrentUser('id') userId: number,
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatService.getConversation(userId, partnerId, pagination.page, pagination.limit);
  }
}
