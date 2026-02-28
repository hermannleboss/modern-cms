import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignPermissionDto } from './dto/user.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user.invite')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('user.read')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('user.read')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('user.invite')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/role')
  @RequirePermissions('user.assign_role')
  async assignRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
  ) {
    return this.usersService.assignRole(id, roleId);
  }

  @Post(':id/permissions')
  @RequirePermissions('user.assign_role')
  async assignPermission(
    @Param('id') id: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.usersService.assignPermission(id, dto);
  }
}
