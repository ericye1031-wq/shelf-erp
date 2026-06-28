import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingRecord, TrainingStatus } from './training-record.entity';
import { CreateTrainingDto, UpdateTrainingDto } from './dto/training.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingRecord)
    private readonly trnRepo: Repository<TrainingRecord>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.trnRepo.createQueryBuilder('t');
    if (keyword) {
      qb.andWhere('(t.code LIKE :kw OR t.title LIKE :kw OR t.trainer LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('t.status = :status', { status });
    if (sortBy) qb.orderBy(`t.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('t.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<TrainingRecord> {
    const trn = await this.trnRepo.findOne({ where: { id } });
    if (!trn) throw new NotFoundException(`培训记录 ${id} 不存在`);
    return trn;
  }

  async create(dto: CreateTrainingDto, userId: string): Promise<TrainingRecord> {
    const count = await this.trnRepo.count();
    const code = generateCode('training', count + 1);
    const trn = this.trnRepo.create({
      code,
      title: dto.title,
      trainer: dto.trainer ?? undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      location: dto.location ?? undefined,
      trainingType: dto.trainingType,
      cost: dto.cost ?? 0,
      participantCount: dto.participantCount ?? 0,
      status: 'planned' as TrainingStatus,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.trnRepo.save(trn);
  }

  async update(id: string, dto: UpdateTrainingDto, userId: string): Promise<TrainingRecord> {
    const trn = await this.findOne(id);
    if (trn.status !== 'planned') throw new BadRequestException('只有计划状态才能编辑');
    Object.assign(trn, dto, {
      startDate: dto.startDate ? new Date(dto.startDate) : trn.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : trn.endDate,
      updatedBy: userId,
    });
    return this.trnRepo.save(trn);
  }

  async remove(id: string): Promise<void> {
    const trn = await this.findOne(id);
    if (trn.status !== 'planned') throw new BadRequestException('只有计划状态才能删除');
    await this.trnRepo.remove(trn);
  }

  async changeStatus(id: string, status: TrainingStatus, userId: string): Promise<TrainingRecord> {
    const trn = await this.findOne(id);
    const validTransitions: Record<string, TrainingStatus[]> = {
      planned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    const allowed = validTransitions[trn.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${trn.status} 变更为 ${status}`);
    trn.status = status;
    trn.updatedBy = userId;
    return this.trnRepo.save(trn);
  }

  // ==================== 技能矩阵 ====================

  /**
   * 内存技能矩阵存储
   * key: employeeId, value: Map<skillName, { level: number; certifiedAt: string; certifiedBy: string }>
   * 注：正式项目应改为数据库实体，此处为演示逻辑用内存存储
   */
  private skillMatrix: Map<string, Map<string, { level: number; certifiedAt: string; certifiedBy: string }>> = new Map();

  /**
   * 获取技能矩阵（按部门筛选可选）
   * 返回 employee × skill 矩阵
   * @param departmentId 可选部门筛选
   */
  getSkillMatrix(departmentId?: string): Array<{
    employeeId: string;
    employeeName: string;
    departmentName: string;
    skills: Array<{ skillName: string; level: number; certifiedAt: string; certifiedBy: string }>;
  }> {
    const result: Array<{
      employeeId: string;
      employeeName: string;
      departmentName: string;
      skills: Array<{ skillName: string; level: number; certifiedAt: string; certifiedBy: string }>;
    }> = [];

    for (const [employeeId, skills] of this.skillMatrix.entries()) {
      // 员工姓名和部门从技能记录中推断（实际应从 employee 表关联查询）
      const skillList: Array<{ skillName: string; level: number; certifiedAt: string; certifiedBy: string }> = [];
      for (const [skillName, detail] of skills.entries()) {
        skillList.push({ skillName, ...detail });
      }
      skillList.sort((a, b) => b.level - a.level);

      result.push({
        employeeId,
        employeeName: `员工_${employeeId.slice(0, 8)}`,
        departmentName: departmentId ? `部门_${departmentId.slice(0, 8)}` : '全部',
        skills: skillList,
      });
    }

    return result;
  }

  /**
   * 获取某员工所有技能
   */
  getEmployeeSkills(employeeId: string): Array<{ skillName: string; level: number; certifiedAt: string; certifiedBy: string }> {
    const skills = this.skillMatrix.get(employeeId);
    if (!skills || skills.size === 0) return [];

    const result: Array<{ skillName: string; level: number; certifiedAt: string; certifiedBy: string }> = [];
    for (const [skillName, detail] of skills.entries()) {
      result.push({ skillName, ...detail });
    }
    return result.sort((a, b) => b.level - a.level);
  }

  /**
   * 认证/更新员工技能
   * @param employeeId 员工ID
   * @param skillName 技能名称
   * @param level 技能等级(1-5)
   * @param certifiedBy 认证人ID
   */
  certifySkill(
    employeeId: string,
    skillName: string,
    level: number,
    certifiedBy: string,
  ): { skillName: string; level: number; certifiedAt: string; certifiedBy: string; isNew: boolean } {
    if (level < 1 || level > 5 || !Number.isInteger(level)) {
      throw new BadRequestException('技能等级必须在 1-5 之间');
    }
    if (!skillName || skillName.trim().length === 0) {
      throw new BadRequestException('技能名称不能为空');
    }

    let employeeSkills = this.skillMatrix.get(employeeId);
    const isNew = !employeeSkills;
    if (!employeeSkills) {
      employeeSkills = new Map();
      this.skillMatrix.set(employeeId, employeeSkills);
    }

    const existing = employeeSkills.get(skillName);
    const certifiedAt = new Date().toISOString();

    employeeSkills.set(skillName, { level, certifiedAt, certifiedBy });

    return {
      skillName,
      level,
      certifiedAt,
      certifiedBy,
      isNew: !existing,
    };
  }
}
