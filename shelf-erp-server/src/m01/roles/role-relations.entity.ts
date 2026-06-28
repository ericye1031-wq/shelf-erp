import { Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/** 用户-角色关联表 */
@Entity('user_roles')
export class UserRole {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  roleId: string;
}

/** 角色-权限关联表 */
@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn('uuid')
  roleId: string;

  @PrimaryColumn('uuid')
  permissionId: string;
}
