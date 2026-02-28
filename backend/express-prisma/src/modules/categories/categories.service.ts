import prisma from '../../utils/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { slugify } from '../../utils/slugify';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

export class CategoriesService {
  async findAll() {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('A category with this name already exists', 409);
    }

    if (dto.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = await prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId || null,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const updateData: any = {};

    if (dto.name) {
      updateData.name = dto.name;
      updateData.slug = slugify(dto.name);

      const existing = await prisma.category.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== id) {
        throw new AppError('A category with this name already exists', 409);
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new AppError('A category cannot be its own parent', 422);
      }
      if (dto.parentId) {
        const parent = await prisma.category.findUnique({ where: { id: dto.parentId } });
        if (!parent) {
          throw new AppError('Parent category not found', 404);
        }
      }
      updateData.parentId = dto.parentId;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    return updated;
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.children.length > 0) {
      throw new AppError('Cannot delete a category with children', 422);
    }

    await prisma.category.delete({ where: { id } });
  }
}
