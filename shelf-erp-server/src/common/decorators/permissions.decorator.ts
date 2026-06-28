import { SetMetadata } from '@nestjs/common';

/** 权限元数据键 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限装饰器，标注接口所需权限码
 * 使用方式: @Permissions('user:create', 'user:update')
 * 配合 RolesGuard 使用
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
