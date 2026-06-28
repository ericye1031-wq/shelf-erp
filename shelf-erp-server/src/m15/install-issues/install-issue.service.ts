import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallIssue, IssueType, IssueStatus, IssueSeverity } from './install-issue.entity';
import { CreateInstallIssueDto, UpdateInstallIssueDto } from './dto/install-issue.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class InstallIssueService {
  constructor(
    @InjectRepository(InstallIssue)
    private readonly issueRepo: Repository<InstallIssue>,
  ) {}

  async findByPlanId(planId: string, dto: PaginationDto) {
    const { page = 1, pageSize = 20, sortBy, sortOrder } = dto;
    const qb = this.issueRepo.createQueryBuilder('ii').where('ii.planId = :planId', { planId });
    if (sortBy) qb.orderBy(`ii.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ii.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, sortBy, sortOrder } = dto;
    const qb = this.issueRepo.createQueryBuilder('ii');
    if (sortBy) qb.orderBy(`ii.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ii.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<InstallIssue> {
    const issue = await this.issueRepo.findOne({ where: { id } });
    if (!issue) throw new NotFoundException(`现场问题 ${id} 不存在`);
    return issue;
  }

  async create(dto: CreateInstallIssueDto, userId: string): Promise<InstallIssue> {
    const entity = this.issueRepo.create({
      planId: dto.planId,
      issueType: dto.issueType as IssueType,
      severity: dto.severity as IssueSeverity,
      description: dto.description,
      photoUrls: dto.photoUrls ?? [],
      createdBy: userId,
    });
    return this.issueRepo.save(entity);
  }

  async update(id: string, dto: UpdateInstallIssueDto): Promise<InstallIssue> {
    const issue = await this.findOne(id);
    if (dto.status) {
      issue.status = dto.status as IssueStatus;
      if (dto.status === 'resolved') {
        issue.resolvedAt = new Date();
      }
    }
    if (dto.solution !== undefined) issue.solution = dto.solution;
    return this.issueRepo.save(issue);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.issueRepo.remove(entity);
  }
}
