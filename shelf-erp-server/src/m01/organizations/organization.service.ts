import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Organization } from './organization.entity';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: TreeRepository<Organization>,
  ) {}

  /** 分页查询组织列表 */
  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.orgRepo.createQueryBuilder('org');

    if (keyword) {
      qb.andWhere('(org.name LIKE :kw OR org.code LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (status) {
      qb.andWhere('org.status = :status', { status });
    }
    if (sortBy) {
      qb.orderBy(`org.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    } else {
      qb.orderBy('org.sort', 'ASC').addOrderBy('org.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return createPaginatedResponse(items, total, page, pageSize);
  }

  /** 获取组织树 */
  async findTree() {
    const roots = await this.orgRepo.findTrees();
    return roots;
  }

  /** 获取组织详情 */
  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`组织 ${id} 不存在`);
    }
    return org;
  }

  /** 创建组织 */
  async create(dto: CreateOrganizationDto, userId: string): Promise<Organization> {
    const existing = await this.orgRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`组织编码 ${dto.code} 已存在`);
    }

    const org = this.orgRepo.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.orgRepo.save(org);
  }

  /** 更新组织 */
  async update(id: string, dto: UpdateOrganizationDto, userId: string): Promise<Organization> {
    const org = await this.findOne(id);

    if (dto.code && dto.code !== org.code) {
      const existing = await this.orgRepo.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`组织编码 ${dto.code} 已存在`);
      }
    }

    Object.assign(org, dto, { updatedBy: userId });
    return this.orgRepo.save(org);
  }

  /** 删除组织 */
  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);

    // 检查是否有子组织
    const children = await this.orgRepo.count({
      where: { parentId: id },
    });
    if (children > 0) {
      throw new ConflictException('该组织下存在子组织，无法删除');
    }

    await this.orgRepo.remove(org);
  }
}
