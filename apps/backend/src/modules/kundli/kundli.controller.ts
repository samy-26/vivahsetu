import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KundliService } from './kundli.service';
import { UpsertKundliDto } from './dto/upsert-kundli.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('kundli')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'kundli', version: '1' })
export class KundliController {
  constructor(private kundliService: KundliService) {}

  @Post('details')
  @ApiOperation({ summary: 'Save kundli/birth details' })
  async upsertDetails(@CurrentUser('id') userId: number, @Body() dto: UpsertKundliDto) {
    return this.kundliService.upsertKundliDetails(userId, dto);
  }

  @Get('details')
  @ApiOperation({ summary: 'Get my kundli details' })
  async getDetails(@CurrentUser('id') userId: number) {
    return this.kundliService.getKundliDetails(userId);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate Kundli PDF' })
  async generate(@CurrentUser('id') userId: number) {
    return this.kundliService.generateKundli(userId);
  }

  @Get('view/:pdfId')
  @ApiOperation({ summary: 'View Kundli as HTML (printable)' })
  async viewHtml(
    @CurrentUser('id') userId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
    @Res() res: Response,
  ) {
    const html = await this.kundliService.viewKundliHtml(userId, pdfId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('download/:pdfId')
  @ApiOperation({ summary: 'Get download URL for Kundli' })
  async download(
    @CurrentUser('id') userId: number,
    @Param('pdfId', ParseIntPipe) pdfId: number,
  ) {
    return this.kundliService.downloadKundli(userId, pdfId);
  }

  @Post('matchmaking/:partnerId')
  @ApiOperation({ summary: 'Generate matchmaking report' })
  async generateMatchmaking(
    @CurrentUser('id') userId: number,
    @Param('partnerId', ParseIntPipe) partnerId: number,
  ) {
    return this.kundliService.generateMatchmakingReport(userId, partnerId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get kundli download history' })
  async getHistory(@CurrentUser('id') userId: number) {
    return this.kundliService.getKundliHistory(userId);
  }

  @Get('matchmaking/history')
  @ApiOperation({ summary: 'Get matchmaking history' })
  async getMatchmakingHistory(@CurrentUser('id') userId: number) {
    return this.kundliService.getMatchmakingHistory(userId);
  }
}
