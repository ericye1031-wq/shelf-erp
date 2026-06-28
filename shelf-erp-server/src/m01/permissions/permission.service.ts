import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from './permission.entity';
import { RolePermission, UserRole } from '../roles/role-relations.entity';

export interface PermissionTreeNode {
  id: string;
  name: string;
  code: string;
  type: string;
  sort: number;
  children?: PermissionTreeNode[];
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly urRepo: Repository<UserRole>,
  ) {}

  /** 获取所有权限（平铺列表） */
  async findAll(): Promise<Permission[]> {
    return this.permRepo.find({ order: { sort: 'ASC' } });
  }

  /** 根据编码查找单条权限 */
  async findByCode(code: string): Promise<Permission | null> {
    return this.permRepo.findOne({ where: { code } });
  }

  /** 获取权限树结构（给前端渲染权限树用） */
  async getPermissionTree(): Promise<PermissionTreeNode[]> {
    const all = await this.permRepo.find({ order: { sort: 'ASC' } });

    // 构建 id -> node 索引
    const map = new Map<string, PermissionTreeNode>();
    for (const p of all) {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        sort: p.sort,
        children: [],
      });
    }

    const roots: PermissionTreeNode[] = [];
    for (const p of all) {
      const node = map.get(p.id)!;
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    // 清理空 children 数组
    const cleanEmpty = (nodes: PermissionTreeNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length === 0) {
          delete n.children;
        } else if (n.children) {
          cleanEmpty(n.children);
        }
      }
    };
    cleanEmpty(roots);

    return roots;
  }

  /** 根据权限编码列表查询权限实体 */
  async findByCodes(codes: string[]): Promise<Permission[]> {
    return this.permRepo.find({ where: { code: In(codes) } });
  }

  /** 获取某用户的权限码列表（通过角色→权限链路） */
  async getUserPermissionCodes(userId: string): Promise<string[]> {
    const userRoles = await this.urRepo.find({ where: { userId } });
    const roleIds = userRoles.map((ur) => ur.roleId);

    if (roleIds.length === 0) return [];

    const rps = await this.rpRepo.find({ where: { roleId: In(roleIds) } });
    const permissionIds = [...new Set(rps.map((rp) => rp.permissionId))];

    if (permissionIds.length === 0) return [];

    const perms = await this.permRepo.find({
      where: { id: In(permissionIds) },
    });
    return perms.map((p) => p.code);
  }

  /** 获取某角色的权限ID列表 */
  async getRolePermissionIds(roleId: string): Promise<string[]> {
    const rps = await this.rpRepo.find({ where: { roleId } });
    return rps.map((rp) => rp.permissionId);
  }

  /** 批量分配角色权限（先删后插） */
  async assignRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    // 验证所有 permissionId 存在
    if (permissionIds.length > 0) {
      const count = await this.permRepo.count({
        where: { id: In(permissionIds) },
      });
      if (count !== permissionIds.length) {
        throw new NotFoundException('部分权限ID不存在');
      }
    }

    // 事务性：先删后插
    await this.rpRepo.delete({ roleId });
    if (permissionIds.length > 0) {
      const entities = permissionIds.map((pid) =>
        this.rpRepo.create({ roleId, permissionId: pid }),
      );
      await this.rpRepo.save(entities);
    }
  }

  /** 创建权限 */
  async create(data: {
    name: string;
    code: string;
    type: string;
    parentId?: string | null;
    sort?: number;
  }): Promise<Permission> {
    const existing = await this.permRepo.findOne({
      where: { code: data.code },
    });
    if (existing) {
      throw new ConflictException(`权限编码 ${data.code} 已存在`);
    }

    // 验证父级存在
    if (data.parentId) {
      const parent = await this.permRepo.findOne({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`父级权限 ${data.parentId} 不存在`);
      }
    }

    return this.permRepo.save(
      this.permRepo.create({
        name: data.name,
        code: data.code,
        type: data.type,
        parentId: data.parentId ?? null,
        sort: data.sort ?? 0,
      }),
    );
  }

  /** 更新权限 */
  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      type?: string;
      parentId?: string | null;
      sort?: number;
    },
  ): Promise<Permission> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) {
      throw new NotFoundException(`权限 ${id} 不存在`);
    }

    if (data.code && data.code !== perm.code) {
      const existing = await this.permRepo.findOne({
        where: { code: data.code },
      });
      if (existing) {
        throw new ConflictException(`权限编码 ${data.code} 已存在`);
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId) {
        const parent = await this.permRepo.findOne({
          where: { id: data.parentId },
        });
        if (!parent) {
          throw new NotFoundException(`父级权限 ${data.parentId} 不存在`);
        }
      }
      perm.parentId = data.parentId;
    }

    Object.assign(perm, data);
    return this.permRepo.save(perm);
  }

  /** 删除权限（同时删除子权限和关联） */
  async remove(id: string): Promise<void> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) {
      throw new NotFoundException(`权限 ${id} 不存在`);
    }

    // 删除子权限
    const children = await this.permRepo.find({ where: { parentId: id } });
    for (const child of children) {
      await this.rpRepo.delete({ permissionId: child.id });
      await this.permRepo.remove(child);
    }

    // 删除角色-权限关联
    await this.rpRepo.delete({ permissionId: id });
    await this.permRepo.remove(perm);
  }
}
