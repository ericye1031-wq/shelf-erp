/**
 * 预置权限种子数据
 *
 * SRS §19 权限矩阵:
 *   - 17 个模块: m01 ~ m17
 *   - 每模块 5 种操作: read, create, update, delete, approve
 *   - 外加角色管理模块 "m01:admin"（角色管理总控）和系统管理权限
 *   - 总计 ~90 条权限
 */

interface SeedPermission {
  name: string;
  code: string;
  type: string;
  sort: number;
  children?: SeedPermission[];
}

/** 为模块生成标准 CRUD + approve 权限子节点 */
function moduleActions(moduleCode: string, labels: string[]): SeedPermission[] {
  const actions: { code: string; label: string }[] = [
    { code: `${moduleCode}:read`, label: '查看' },
    { code: `${moduleCode}:create`, label: '新增' },
    { code: `${moduleCode}:update`, label: '编辑' },
    { code: `${moduleCode}:delete`, label: '删除' },
    { code: `${moduleCode}:approve`, label: '审批' },
  ];
  return actions.map((a, i) => ({
    name: `${labels[i] ?? a.label}`,
    code: a.code,
    type: 'button',
    sort: i + 1,
  }));
}

export const permissionSeeds: SeedPermission[] = [
  // ========== M01: 系统管理 ==========
  {
    name: 'M01-系统管理',
    code: 'm01',
    type: 'menu',
    sort: 1,
    children: [
      { name: '用户管理', code: 'm01:user', type: 'menu', sort: 1, children: moduleActions('m01:user', ['查看用户', '新增用户', '编辑用户', '删除用户', '审批用户']) },
      { name: '角色管理', code: 'm01:role', type: 'menu', sort: 2, children: moduleActions('m01:role', ['查看角色', '新增角色', '编辑角色', '删除角色', '审批角色']) },
      { name: '组织管理', code: 'm01:org', type: 'menu', sort: 3, children: moduleActions('m01:org', ['查看组织', '新增组织', '编辑组织', '删除组织', '审批组织']) },
      { name: '权限管理', code: 'm01:admin', type: 'menu', sort: 4, children: [
        { name: '权限分配', code: 'm01:admin', type: 'button', sort: 1 },
      ]},
    ],
  },

  // ========== M02: 客户管理 ==========
  {
    name: 'M02-客户管理',
    code: 'm02',
    type: 'menu',
    sort: 2,
    children: moduleActions('m02', ['查看客户', '新增客户', '编辑客户', '删除客户', '审批客户']),
  },

  // ========== M03: 产品与BOM设计 ==========
  {
    name: 'M03-产品与BOM设计',
    code: 'm03',
    type: 'menu',
    sort: 3,
    children: moduleActions('m03', ['查看产品', '新增产品', '编辑产品', '删除产品', '审批产品']),
  },

  // ========== M04: 技术规格与图纸 ==========
  {
    name: 'M04-技术规格与图纸',
    code: 'm04',
    type: 'menu',
    sort: 4,
    children: moduleActions('m04', ['查看图纸', '新增图纸', '编辑图纸', '删除图纸', '审批图纸']),
  },

  // ========== M05: 报价管理 ==========
  {
    name: 'M05-报价管理',
    code: 'm05',
    type: 'menu',
    sort: 5,
    children: moduleActions('m05', ['查看报价', '新增报价', '编辑报价', '删除报价', '审批报价']),
  },

  // ========== M06: 合同管理 ==========
  {
    name: 'M06-合同管理',
    code: 'm06',
    type: 'menu',
    sort: 6,
    children: moduleActions('m06', ['查看合同', '新增合同', '编辑合同', '删除合同', '审批合同']),
  },

  // ========== M07: 项目与任务 ==========
  {
    name: 'M07-项目与任务',
    code: 'm07',
    type: 'menu',
    sort: 7,
    children: moduleActions('m07', ['查看项目', '新增项目', '编辑项目', '删除项目', '审批项目']),
  },

  // ========== M08: 生产进度看板 ==========
  {
    name: 'M08-生产进度看板',
    code: 'm08',
    type: 'menu',
    sort: 8,
    children: moduleActions('m08', ['查看看板', '新增看板', '编辑看板', '删除看板', '审批看板']),
  },

  // ========== M09: 采购管理 ==========
  {
    name: 'M09-采购管理',
    code: 'm09',
    type: 'menu',
    sort: 9,
    children: moduleActions('m09', ['查看采购', '新增采购', '编辑采购', '删除采购', '审批采购']),
  },

  // ========== M10: 生产管理 ==========
  {
    name: 'M10-生产管理',
    code: 'm10',
    type: 'menu',
    sort: 10,
    children: moduleActions('m10', ['查看生产', '新增生产', '编辑生产', '删除生产', '审批生产']),
  },

  // ========== M11: 仓储管理 ==========
  {
    name: 'M11-仓储管理',
    code: 'm11',
    type: 'menu',
    sort: 11,
    children: moduleActions('m11', ['查看仓储', '新增仓储', '编辑仓储', '删除仓储', '审批仓储']),
  },

  // ========== M12: 成本核算 ==========
  {
    name: 'M12-成本核算',
    code: 'm12',
    type: 'menu',
    sort: 12,
    children: moduleActions('m12', ['查看成本', '新增成本', '编辑成本', '删除成本', '审批成本']),
  },

  // ========== M13: 财务管理 ==========
  {
    name: 'M13-财务管理',
    code: 'm13',
    type: 'menu',
    sort: 13,
    children: moduleActions('m13', ['查看财务', '新增财务', '编辑财务', '删除财务', '审批财务']),
  },

  // ========== M14: 质量管理 ==========
  {
    name: 'M14-质量管理',
    code: 'm14',
    type: 'menu',
    sort: 14,
    children: moduleActions('m14', ['查看质量', '新增质量', '编辑质量', '删除质量', '审批质量']),
  },

  // ========== M15: 报表分析 ==========
  {
    name: 'M15-报表分析',
    code: 'm15',
    type: 'menu',
    sort: 15,
    children: moduleActions('m15', ['查看报表', '新增报表', '编辑报表', '删除报表', '审批报表']),
  },

  // ========== M16: 消息与通知 ==========
  {
    name: 'M16-消息与通知',
    code: 'm16',
    type: 'menu',
    sort: 16,
    children: moduleActions('m16', ['查看消息', '新增消息', '编辑消息', '删除消息', '审批消息']),
  },

  // ========== M17: 系统日志与审计 ==========
  {
    name: 'M17-系统日志与审计',
    code: 'm17',
    type: 'menu',
    sort: 17,
    children: moduleActions('m17', ['查看日志', '新增日志', '编辑日志', '删除日志', '审批日志']),
  },
];
