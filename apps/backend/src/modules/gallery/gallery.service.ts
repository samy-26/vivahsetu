import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService, private storageService: StorageService) {}

  async upload(file: Express.Multer.File, category?: string, caption?: string) {
    const { url, key } = await this.storageService.uploadFile(file, 'gallery');
    return this.prisma.gallery.create({
      data: { imageUrl: url, imageKey: key, category, caption },
    });
  }

  async getAll(category?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (category) where.category = category;
    const [images, total] = await Promise.all([
      this.prisma.gallery.findMany({
        where,
        skip, take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.gallery.count({ where }),
    ]);
    return { images, total, page, limit };
  }

  async delete(id: number) {
    const image = await this.prisma.gallery.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    await this.storageService.deleteFile(image.imageKey);
    await this.prisma.gallery.delete({ where: { id } });
    return { message: 'Image deleted' };
  }
}
