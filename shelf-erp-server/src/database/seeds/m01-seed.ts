import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../m01/organizations/organization.entity';
import { User } from '../../m01/users/user.entity';
import { Role } from '../../m01/roles/role.entity';
import { UserRole } from '../../m01/roles/role-relations.entity';
import { Permission } from '../../m01/permissions/permission.entity';
import { permissionSeeds } from '../../m01/permissions/permission.seed';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * M01 系统管理种子数据
 */
export async function runM01Seed(dataSource: DataSource): Promise<void> {
  console.log('📦 运行 M01 种子数据...');

  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const urRepo = dataSource.getRepository(UserRole);
  const permRepo = dataSource.getRepository(Permission);

  // 1. 组织架构
  let companyId = '';
  const orgCount = await orgRepo.count();
  if (orgCount === 0) {
    const company = await orgRepo.save(
      orgRepo.create({
        id: uuidv4(),
        name: '货架集团',
        code: 'GROUP',
        type: 'group',
        sort: 0,
        status: 'active',
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      }),
    );
    companyId = (company as Organization).id;

    const depts = [
      { name: '销售部', code: 'DEPT-SALES', sort: 1 },
      { name: '工程部', code: 'DEPT-ENGINEERING', sort: 2 },
      { name: '生产部', code: 'DEPT-PRODUCTION', sort: 3 },
      { name: '仓库部', code: 'DEPT-WAREHOUSE', sort: 4 },
      { name: '财务部', code: 'DEPT-FINANCE', sort: 5 },
      { name: '品质部', code: 'DEPT-QUALITY', sort: 6 },
    ];
    for (const d of depts) {
      await orgRepo.save(
        orgRepo.create({
          id: uuidv4(),
          ...d,
          type: 'department',
          parentId: companyId,
          status: 'active',
          createdBy: SYSTEM_USER_ID,
          updatedBy: SYSTEM_USER_ID,
        }),
      );
    }
    console.log('  ✅ 组织架构已创建');
  } else {
    const company = await orgRepo.findOne({ where: { code: 'GROUP' } });
    companyId = company?.id ?? '';
  }

  // 2. 预置角色
  let adminRoleId = '';
  const roleCount = await roleRepo.count();
  if (roleCount === 0) {
    const roles = [
      { name: '系统管理员', code: 'admin', description: '拥有所有权限' },
      { name: '经理', code: 'manager', description: '管理级别权限' },
      { name: '销售', code: 'sales', description: '销售相关权限' },
      { name: '工程师', code: 'engineer', description: '工程配置权限' },
      { name: '仓库', code: 'warehouse', description: '仓库管理权限' },
      { name: '财务', code: 'finance', description: '财务相关权限' },
      { name: '生产', code: 'production', description: '生产管理权限' },
      { name: '品质', code: 'quality', description: '品质检查权限' },
    ];
    for (const r of roles) {
      const saved = await roleRepo.save(
        roleRepo.create({
          ...r,
          id: uuidv4(),
          status: 'active',
          createdBy: SYSTEM_USER_ID,
          updatedBy: SYSTEM_USER_ID,
        }),
      );
      if (r.code === 'admin') {
        adminRoleId = (saved as Role).id;
      }
    }
    console.log('  ✅ 8个预置角色已创建');
  } else {
    const adminRole = await roleRepo.findOne({ where: { code: 'admin' } });
    adminRoleId = adminRole?.id ?? '';
  }

  // 3. 权限树（Permission 实体无 createdBy/updatedBy 字段）
  const permCount = await permRepo.count();
  if (permCount === 0) {
    await seedPermissionTree(permRepo, permissionSeeds, null);
    console.log('  ✅ 权限树已创建');
  }

  // 4. 默认管理员用户
  const userCount = await userRepo.count();
  if (userCount === 0 && companyId) {
    const hashed = await bcrypt.hash('admin123', 12);
    const admin = await userRepo.save(
      userRepo.create({
        id: uuidv4(),
        username: 'admin',
        password: hashed,
        name: '系统管理员',
        status: 'active',
        orgId: companyId,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      }),
    );

    if (adminRoleId) {
      await urRepo.save({
        userId: (admin as User).id,
        roleId: adminRoleId,
      });
    }
    console.log('  ✅ 默认管理员用户已创建 (admin/admin123)');
  }

  console.log('📦 M01 种子数据运行完成');
}

/** 递归创建权限树 */
async function seedPermissionTree(
  repo: Repository<Permission>,
  seeds: { name: string; code: string; type: string; sort: number; children?: unknown[] }[],
  parentId: string | null,
): Promise<void> {
  for (const seed of seeds) {
    const perm = repo.create({
      id: uuidv4(),
      name: seed.name,
      code: seed.code,
      type: seed.type,
      sort: seed.sort,
      parentId,
    });
    const saved = await repo.save(perm);
    const children = (seed as { children?: unknown[] }).children;
    if (children && Array.isArray(children) && children.length > 0) {
      await seedPermissionTree(repo, children as { name: string; code: string; type: string; sort: number; children?: unknown[] }[], (saved as Permission).id);
    }
  }
}
