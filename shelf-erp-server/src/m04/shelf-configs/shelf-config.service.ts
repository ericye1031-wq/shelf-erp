import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelfConfig } from './shelf-config.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { Specification } from '../specifications/specification.entity';
import { CreateShelfConfigDto, UpdateShelfConfigDto } from './dto/shelf-config.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ShelfConfigService {
  constructor(
    @InjectRepository(ShelfConfig)
    private readonly configRepo: Repository<ShelfConfig>,
    @InjectRepository(ShelfType)
    private readonly shelfTypeRepo: Repository<ShelfType>,
    @InjectRepository(Specification)
    private readonly specRepo: Repository<Specification>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.configRepo.createQueryBuilder('c');
    if (keyword) {
      qb.andWhere('(c.name LIKE :kw OR c.shelfTypeName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('c.status = :status', { status });
    if (sortBy) qb.orderBy(`c.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('c.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<ShelfConfig> {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`货架配置 ${id} 不存在`);
    return config;
  }

  async create(dto: CreateShelfConfigDto, userId: string): Promise<ShelfConfig> {
    const st = await this.shelfTypeRepo.findOne({ where: { id: dto.shelfTypeId } });
    if (!st) throw new NotFoundException(`货架类型 ${dto.shelfTypeId} 不存在`);
    const config = this.configRepo.create({
      shelfTypeId: dto.shelfTypeId,
      shelfTypeName: st.name,
      name: dto.name,
      parameters: dto.parameters ?? {},
      createdBy: userId,
      updatedBy: userId,
    });
    return this.configRepo.save(config);
  }

  async update(id: string, dto: UpdateShelfConfigDto, userId: string): Promise<ShelfConfig> {
    const config = await this.findOne(id);
    Object.assign(config, dto, { updatedBy: userId });
    return this.configRepo.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepo.remove(config);
  }

  /** 规格匹配：根据配置参数找到最佳匹配的规格 */
  async matchSpec(configId: string): Promise<Specification | null> {
    const config = await this.findOne(configId);
    const specs = await this.specRepo.find({ where: { shelfTypeId: config.shelfTypeId } });
    if (specs.length === 0) return null;

    const params = config.parameters ?? {};
    let bestMatch: Specification | null = null;
    let bestScore = -1;

    for (const spec of specs) {
      const constraints = spec.parameterConstraints ?? {};
      let score = 0;
      let matched = true;

      for (const [key, constraint] of Object.entries(constraints)) {
        const paramValue = params[key];
        if (paramValue === undefined) {
          matched = false;
          break;
        }
        const numValue = typeof paramValue === 'number' ? paramValue : parseFloat(String(paramValue));
        const constraintObj = constraint as Record<string, unknown>;
        const min = constraintObj['min'] as number | undefined;
        const max = constraintObj['max'] as number | undefined;

        if (min !== undefined && numValue < min) { matched = false; break; }
        if (max !== undefined && numValue > max) { matched = false; break; }
        score++;
      }

      if (matched && score > bestScore) {
        bestScore = score;
        bestMatch = spec;
      }
    }

    return bestMatch;
  }
}
