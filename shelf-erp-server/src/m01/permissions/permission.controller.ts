import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

/** 批量分配权限 DTO */
class AssignPermissionsDto {
  roleId: string;
  permissionIds: string[];
}

@ApiTags('M01-权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m01/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /** 获取权限树（前端渲染权限选择器） */
  @Get('tree')
  @Permissions('m01:admin')
  @ApiOperation({ summary: '获取权限树' })
  getTree() {
    return this.permissionService.getPermissionTree();
  }

  /** 平铺列表 */
  @Get()
  @Permissions('m01:admin')
  @ApiOperation({ summary: '获取所有权限列表' })
  findAll() {
    return this.permissionService.findAll();
  }

  /** 批量分配权限到角色 */
  @Post('assign')
  @Permissions('m01:admin')
  @ApiOperation({ summary: '批量分配权限到角色' })
  assignPermissions(@Body() dto: AssignPermissionsDto) {
    return this.permissionService.assignRolePermissions(
      dto.roleId,
      dto.permissionIds,
    );
  }
}
