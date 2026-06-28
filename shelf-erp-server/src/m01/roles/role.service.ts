import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission, UserRole } from './role-relations.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly urRepo: Repository<UserRole>,
  ) {}

  /** 分页查询角色列表 */
  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.roleRepo.createQueryBuilder('role');

    if (keyword) {
      qb.andWhere('(role.name LIKE :kw OR role.code LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (status) {
      qb.andWhere('role.status = :status', { status });
    }
    if (sortBy) {
      qb.orderBy(`role.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    } else {
      qb.orderBy('role.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return createPaginatedResponse(items, total, page, pageSize);
  }

  /** 获取角色详情 */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`角色 ${id} 不存在`);
    }
    return role;
  }

  /** 获取角色权限ID列表 */
  async getPermissionIds(roleId: string): Promise<string[]> {
    const rps = await this.rpRepo.find({ where: { roleId } });
    return rps.map((rp) => rp.permissionId);
  }

  /** 获取用户所有权限码列表 */
  async getUserPermissionCodes(userId: string): Promise<string[]> {
    const userRoles = await this.urRepo.find({ where: { userId } });
    const roleIds = userRoles.map((ur) => ur.roleId);

    if (roleIds.length === 0) {
      return [];
    }

    const rps = await this.rpRepo.find({
      where: { roleId: In(roleIds) },
    });
    const permissionIds = [...new Set(rps.map((rp) => rp.permissionId))];

    if (permissionIds.length === 0) {
      return [];
    }

    // 查询权限码（此处简单返回 permissionIds，完整实现需 join permissions 表）
    return permissionIds;
  }

  /** 创建角色 */
  async create(dto: CreateRoleDto, userId: string): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`角色编码 ${dto.code} 已存在`);
    }

    const role = this.roleRepo.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.roleRepo.save(role);

    // 保存权限关联
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.saveRolePermissions(saved.id, dto.permissionIds);
    }

    return saved;
  }

  /** 更新角色 */
  async update(id: string, dto: UpdateRoleDto, userId: string): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.code && dto.code !== role.code) {
      const existing = await this.roleRepo.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`角色编码 ${dto.code} 已存在`);
      }
    }

    Object.assign(role, dto, { updatedBy: userId });
    const saved = await this.roleRepo.save(role);

    // 更新权限关联
    if (dto.permissionIds !== undefined) {
      await this.rpRepo.delete({ roleId: id });
      if (dto.permissionIds.length > 0) {
        await this.saveRolePermissions(id, dto.permissionIds);
      }
    }

    return saved;
  }

  /** 删除角色 */
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // 检查是否有用户关联
    const userCount = await this.urRepo.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new ConflictException('该角色下存在用户，无法删除');
    }

    await this.rpRepo.delete({ roleId: id });
    await this.roleRepo.remove(role);
  }

  /** 保存角色-权限关联 */
  private async saveRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const entities = permissionIds.map((pid) =>
      this.rpRepo.create({ roleId, permissionId: pid }),
    );
    await this.rpRepo.save(entities);
  }
}
