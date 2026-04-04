import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('interests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'interests', version: '1' })
export class InterestsController {
  constructor(private interestsService: InterestsService) {}

  @Post(':receiverId')
  @ApiOperation({ summary: 'Send interest to a profile' })
  async sendInterest(
    @CurrentUser('id') userId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Body('message') message?: string,
  ) {
    return this.interestsService.sendInterest(userId, receiverId, message);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Accept or reject an interest' })
  async respond(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'ACCEPTED' | 'REJECTED',
  ) {
    return this.interestsService.respondToInterest(userId, id, status);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent interests' })
  async getSent(@CurrentUser('id') userId: number, @Query() pagination: PaginationDto) {
    return this.interestsService.getSentInterests(userId, pagination.page, pagination.limit);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get received interests' })
  async getReceived(@CurrentUser('id') userId: number, @Query() pagination: PaginationDto) {
    return this.interestsService.getReceivedInterests(userId, pagination.page, pagination.limit);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get accepted matches' })
  async getMatches(@CurrentUser('id') userId: number) {
    return this.interestsService.getAcceptedMatches(userId);
  }
}
