import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my active subscription' })
  async getMySubscription(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get subscription history' })
  async getHistory(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getSubscriptionHistory(userId);
  }
}
