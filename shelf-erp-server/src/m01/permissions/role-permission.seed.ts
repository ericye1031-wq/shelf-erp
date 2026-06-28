/**
 * 角色-权限映射种子数据
 * SRS §19 权限矩阵：各角色对应的权限码模式
 *
 * 使用权限码模式（字符串匹配前缀），在运行时将模式展开为具体的 permissionIds。
 * 种子执行时需配合已写入 permissions 表的具体记录使用。
 */

export interface RolePermissionSeed {
  /** 角色编码 */
  roleCode: string;
  /** 角色名称（中文） */
  roleName: string;
  /** 角色描述 */
  description: string;
  /**
   * 权限匹配模式列表：
   *   - "m02:*"  → 匹配前缀 "m02:" 的所有权限
   *   - "*"      → 全部权限
   *   - "m02:read" → 精确匹配
   */
  permissionPatterns: string[];
}

export const rolePermissionSeeds: RolePermissionSeed[] = [
  {
    roleCode: 'admin',
    roleName: '董事长/超级管理员',
    description: '拥有系统全部权限',
    permissionPatterns: ['*'],
  },
  {
    roleCode: 'general_manager',
    roleName: '总经理',
    description: '除部分删除权限外，拥有绝大多数权限',
    permissionPatterns: [
      'm01:admin',
      'm01:user:read', 'm01:user:create', 'm01:user:update', 'm01:user:approve',
      'm01:role:read', 'm01:role:create', 'm01:role:update',
      'm01:org:read', 'm01:org:create', 'm01:org:update',
      'm02:read', 'm02:create', 'm02:update', 'm02:approve',
      'm03:read', 'm03:create', 'm03:update', 'm03:approve',
      'm04:read', 'm04:create', 'm04:update', 'm04:approve',
      'm05:read', 'm05:create', 'm05:update', 'm05:approve',
      'm06:read', 'm06:create', 'm06:update', 'm06:approve',
      'm07:read', 'm07:create', 'm07:update', 'm07:approve',
      'm08:read', 'm08:create', 'm08:update', 'm08:approve',
      'm09:read', 'm09:create', 'm09:update', 'm09:approve',
      'm10:read', 'm10:create', 'm10:update', 'm10:approve',
      'm11:read', 'm11:create', 'm11:update', 'm11:approve',
      'm12:read', 'm12:create', 'm12:update', 'm12:approve',
      'm13:read', 'm13:create', 'm13:update', 'm13:approve',
      'm14:read', 'm14:create', 'm14:update', 'm14:approve',
      'm15:read', 'm15:create', 'm15:update', 'm15:approve',
      'm16:read', 'm16:create', 'm16:update', 'm16:approve',
      'm17:read', 'm17:create', 'm17:update', 'm17:approve',
    ],
  },
  {
    roleCode: 'sales_manager',
    roleName: '销售经理',
    description: '负责客户、报价、合同管理',
    permissionPatterns: [
      'm02:*',
      'm05:*',
      'm06:*',
    ],
  },
  {
    roleCode: 'design_manager',
    roleName: '设计经理',
    description: '负责产品设计、BOM与技术图纸',
    permissionPatterns: [
      'm03:*',
      'm04:*',
    ],
  },
  {
    roleCode: 'procurement_manager',
    roleName: '采购经理',
    description: '负责采购管理',
    permissionPatterns: [
      'm09:*',
    ],
  },
  {
    roleCode: 'production_manager',
    roleName: '生产经理',
    description: '负责生产与工单管理',
    permissionPatterns: [
      'm10:*',
    ],
  },
  {
    roleCode: 'warehouse_supervisor',
    roleName: '仓库主管',
    description: '负责仓储管理',
    permissionPatterns: [
      'm11:*',
    ],
  },
  {
    roleCode: 'finance_manager',
    roleName: '财务经理',
    description: '负责财务与成本管理',
    permissionPatterns: [
      'm12:*',
      'm13:*',
    ],
  },
];

/**
 * 将角色权限种子数据中的 pattern 展开为实际权限码集合
 *
 * @param allPermissionCodes 数据库中所有权限码
 * @param patterns 角色配置的权限匹配模式
 * @returns 展开后的权限码列表
 */
export function expandPermissionPatterns(
  allPermissionCodes: string[],
  patterns: string[],
): string[] {
  // admin 通配符：所有权限
  if (patterns.includes('*')) {
    return allPermissionCodes;
  }

  const result = new Set<string>();

  for (const pattern of patterns) {
    if (pattern.endsWith(':*')) {
      // 前缀匹配："m02:*" → 所有 m02: 开头的权限码
      const prefix = pattern.slice(0, -1); // "m02:"
      for (const code of allPermissionCodes) {
        if (code.startsWith(prefix)) {
          result.add(code);
        }
      }
    } else {
      // 精确匹配
      result.add(pattern);
    }
  }

  return [...result];
}
