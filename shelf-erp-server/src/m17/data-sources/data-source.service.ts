import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from './data-source.entity';
import { CreateDataSourceDto } from './dto/data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSource)
    private readonly repo: Repository<DataSource>,
  ) {}

  async findAll(query: any): Promise<{ data: DataSource[]; total: number }> {
    const { name, type, isActive, isDefault, createdBy, page = 1, pageSize = 10 } = query;
    const qb = this.repo.createQueryBuilder('ds');
    if (name) qb.andWhere('ds.name LIKE :name', { name: `%${name}%` });
    if (type) qb.andWhere('ds.type = :type', { type });
    if (isActive !== undefined) qb.andWhere('ds.isActive = :isActive', { isActive });
    if (isDefault !== undefined) qb.andWhere('ds.isDefault = :isDefault', { isDefault });
    if (createdBy) qb.andWhere('ds.createdBy = :createdBy', { createdBy });
    qb.orderBy('ds.createdAt', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<DataSource | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateDataSourceDto): Promise<DataSource> {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity) as unknown as Promise<DataSource>;
  }

  async update(id: number, dto: any): Promise<DataSource | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
