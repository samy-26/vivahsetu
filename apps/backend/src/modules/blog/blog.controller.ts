import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('blog')
@Controller({ path: 'blog', version: '1' })
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published blogs' })
  async getAll(@Query() pagination: PaginationDto) {
    return this.blogService.getAll(pagination.page, pagination.limit);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get blog by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.blogService.getBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create blog (Admin)' })
  async create(@Body() dto: CreateBlogDto, @CurrentUser('id') userId: number) {
    return this.blogService.create(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update blog (Admin)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateBlogDto>) {
    return this.blogService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog (Admin)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
}
