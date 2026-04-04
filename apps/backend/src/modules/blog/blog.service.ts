import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlogDto, authorId: number) {
    const slug =
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now()}`;
    return this.prisma.blog.create({
      data: { ...dto, slug, authorId },
    });
  }

  async getAll(page: number, limit: number, published = true) {
    const skip = (page - 1) * limit;
    const where = published ? { isPublished: true } : {};
    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blog.count({ where }),
    ]);
    return { blogs, total, page, limit };
  }

  async getBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    if (!blog) throw new NotFoundException('Blog not found');
    await this.prisma.blog.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
    return blog;
  }

  async update(id: number, dto: Partial<CreateBlogDto>) {
    return this.prisma.blog.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted' };
  }
}
