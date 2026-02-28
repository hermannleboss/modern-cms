import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  UpdateArticleStatusDto,
} from './dto/article.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPermissions } from '../common/decorators/user-permissions.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @RequirePermissions('article.create')
  async create(
    @Body() dto: CreateArticleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.articlesService.create(dto, userId);
  }

  @Get()
  @RequirePermissions('article.read')
  async findAll(@Query('status') status?: string) {
    return this.articlesService.findAll(status);
  }

  @Get(':id')
  @RequirePermissions('article.read')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  @RequirePermissions('article.read')
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Patch(':id')
  @RequirePermissions('article.update.own', 'article.update.any')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('id') userId: string,
    @UserPermissions() permissions: string[],
  ) {
    return this.articlesService.update(id, dto, userId, permissions);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateArticleStatusDto,
    @CurrentUser('id') userId: string,
    @UserPermissions() permissions: string[],
  ) {
    return this.articlesService.updateStatus(id, dto.status, userId, permissions);
  }

  @Delete(':id')
  @RequirePermissions('article.update.own', 'article.update.any')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @UserPermissions() permissions: string[],
  ) {
    return this.articlesService.delete(id, userId, permissions);
  }

  // --- Locking ---

  @Post(':id/lock')
  @RequirePermissions('article.update.own', 'article.update.any')
  async acquireLock(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.articlesService.acquireLock(id, userId);
  }

  @Delete(':id/lock')
  async releaseLock(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.articlesService.releaseLock(id, userId);
  }

  @Delete(':id/lock/force')
  @RequirePermissions('article.update.any')
  async forceReleaseLock(@Param('id') id: string) {
    return this.articlesService.forceReleaseLock(id);
  }

  // --- Revisions ---

  @Get(':id/revisions')
  @RequirePermissions('article.read')
  async getRevisions(@Param('id') id: string) {
    return this.articlesService.getRevisions(id);
  }

  // --- Preview ---

  @Get(':id/preview')
  @RequirePermissions('article.read')
  async preview(@Param('id') id: string) {
    return this.articlesService.preview(id);
  }
}
