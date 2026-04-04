import {
  Controller, Get, Post, Delete, Param, ParseIntPipe, UseGuards,
  Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('gallery')
@Controller({ path: 'gallery', version: '1' })
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get gallery images' })
  async getAll(
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.galleryService.getAll(category, +page, +limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload gallery image (Admin)' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('category') category?: string,
    @Query('caption') caption?: string,
  ) {
    return this.galleryService.upload(file, category, caption);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete gallery image (Admin)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.delete(id);
  }
}
