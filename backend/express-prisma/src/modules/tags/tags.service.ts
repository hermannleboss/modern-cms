import prisma from '../../utils/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { slugify } from '../../utils/slugify';
import { CreateTagDto, UpdateTagDto } from './tags.dto';

export class TagsService {
  async findAll() {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }
    return tag;
  }

  async create(dto: CreateTagDto) {
    const slug = slugify(dto.name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('A tag with this name already exists', 409);
    }

    return prisma.tag.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    const slug = slugify(dto.name);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw new AppError('A tag with this name already exists', 409);
    }

    return prisma.tag.update({
      where: { id },
      data: { name: dto.name, slug },
    });
  }

  async delete(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    await prisma.tag.delete({ where: { id } });
  }
}
