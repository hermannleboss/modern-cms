import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const slug = this.generateSlug(dto.name);

    const existing = await this.prisma.tag.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.create({
      data: { name: dto.name, slug },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = this.generateSlug(dto.name);
    }

    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.tag.delete({ where: { id } });
    return { message: 'Tag deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
