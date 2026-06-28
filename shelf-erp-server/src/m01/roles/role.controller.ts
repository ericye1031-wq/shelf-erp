import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M01-角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m01/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.roleService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get(':id/permissions')
  getPermissions(@Param('id') id: string) {
    return this.roleService.getPermissionIds(id);
  }

  @Post()
  create(
    @Body() dto: CreateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.roleService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.roleService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
