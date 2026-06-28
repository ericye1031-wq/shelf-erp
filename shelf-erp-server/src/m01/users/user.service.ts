import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UserRole } from '../roles/role-relations.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly urRepo: Repository<UserRole>,
  ) {}

  /** 分页查询用户列表 */
  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.userRepo.createQueryBuilder('user');

    if (keyword) {
      qb.andWhere(
        '(user.name LIKE :kw OR user.username LIKE :kw OR user.phone LIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }
    if (status) {
      qb.andWhere('user.status = :status', { status });
    }
    if (sortBy) {
      qb.orderBy(`user.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 隐藏密码
    const sanitized = items.map((u) => this.sanitizeUser(u));

    return createPaginatedResponse(sanitized, total, page, pageSize);
  }

  /** 获取用户详情 */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    return user;
  }

  /** 根据用户名查找（认证用） */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  /** 创建用户 */
  async create(dto: CreateUserDto, userId: string): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException(`用户名 ${dto.username} 已存在`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      orgId: dto.orgId,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.userRepo.save(user);

    // 保存角色关联
    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.saveUserRoles(saved.id, dto.roleIds);
    }

    return this.sanitizeUser(saved);
  }

  /** 更新用户 */
  async update(id: string, dto: UpdateUserDto, userId: string): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, dto, { updatedBy: userId });
    const saved = await this.userRepo.save(user);

    // 更新角色关联
    if (dto.roleIds !== undefined) {
      await this.urRepo.delete({ userId: id });
      if (dto.roleIds.length > 0) {
        await this.saveUserRoles(id, dto.roleIds);
      }
    }

    return this.sanitizeUser(saved);
  }

  /** 修改密码 */
  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findOne(id);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('旧密码不正确');
    }

    user.password = await bcrypt.hash(dto.newPassword, 12);
    user.updatedBy = id;
    await this.userRepo.save(user);
  }

  /** 删除用户 */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.urRepo.delete({ userId: id });
    await this.userRepo.remove(user);
  }

  /** 获取用户角色ID列表 */
  async getRoleIds(userId: string): Promise<string[]> {
    const urs = await this.urRepo.find({ where: { userId } });
    return urs.map((ur) => ur.roleId);
  }

  /** 保存用户-角色关联 */
  private async saveUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const entities = roleIds.map((rid) =>
      this.urRepo.create({ userId, roleId: rid }),
    );
    await this.urRepo.save(entities);
  }

  /** 隐藏密码字段 */
  private sanitizeUser(user: User): User {
    const clone = { ...user };
    clone.password = undefined as unknown as string;
    return clone;
  }
}
