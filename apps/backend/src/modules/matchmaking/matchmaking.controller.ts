import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchmakingService } from './matchmaking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('matchmaking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'matchmaking', version: '1' })
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get profile recommendations' })
  async getRecommendations(@CurrentUser('id') userId: number, @Query() pagination: PaginationDto) {
    return this.matchmakingService.getRecommendations(userId, pagination.page, pagination.limit);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard(@CurrentUser('id') userId: number) {
    return this.matchmakingService.getDashboardStats(userId);
  }
}
