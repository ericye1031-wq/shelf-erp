import type { AuditFields, StatusType } from './common';

/** 组织机构 */
export interface Organization {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  type: 'group' | 'company' | 'factory' | 'department';
  contact: string;
  phone: string;
  address: string;
  status: StatusType;
  sort: number;
  audit: AuditFields;
}

/** 用户 */
export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  orgId: string;
  orgName: string;
  roleIds: string[];
  status: StatusType;
  avatar: string;
  audit: AuditFields;
}

/** 角色 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
  status: StatusType;
  audit: AuditFields;
}

/** 权限 */
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'data';
  parentId: string | null;
  sort: number;
}

/** 数据字典 */
export interface Dictionary {
  id: string;
  category: string;
  code: string;
  label: string;
  value: string;
  sort: number;
  parentId: string | null;
  remark: string;
}

/** 系统日志 */
export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  ip: string;
  detail: string;
  createdAt: string;
}

/** 系统配置 */
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  group: string;
  remark: string;
  updatedAt: string;
}
