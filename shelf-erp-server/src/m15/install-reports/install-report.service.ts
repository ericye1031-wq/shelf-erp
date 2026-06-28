import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallReport } from './install-report.entity';
import { CreateInstallReportDto, PDAReportDto, DailyReportQueryDto } from './dto/install-report.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class InstallReportService {
  constructor(
    @InjectRepository(InstallReport)
    private readonly reportRepo: Repository<InstallReport>,
  ) {}

  async findByPlanId(planId: string, dto: PaginationDto) {
    const { page = 1, pageSize = 20 } = dto;
    const qb = this.reportRepo.createQueryBuilder('ir').where('ir.planId = :planId', { planId });
    qb.orderBy('ir.workDate', 'DESC').addOrderBy('ir.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, sortBy, sortOrder } = dto;
    const qb = this.reportRepo.createQueryBuilder('ir');
    if (sortBy) qb.orderBy(`ir.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ir.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<InstallReport> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`报工记录 ${id} 不存在`);
    return report;
  }

  async create(dto: CreateInstallReportDto, userId: string): Promise<InstallReport> {
    const entity = this.reportRepo.create({
      planId: dto.planId,
      workerName: dto.workerName,
      workDate: new Date(dto.workDate),
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      overtimeHours: dto.overtimeHours ?? 0,
      workContent: dto.workContent ?? null,
      completionPercent: dto.completionPercent ?? 0,
      teamId: null,
      qrCode: null,
      photoAttachments: null,
      source: 'web',
      createdBy: userId,
    } as any);
    return this.reportRepo.save(entity) as unknown as InstallReport;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.reportRepo.remove(entity);
  }

  /** PDA移动端报工：扫码+记录时间+拍照 */
  async submitPDAReport(dto: PDAReportDto, userId: string): Promise<InstallReport> {
    const entity = this.reportRepo.create({
      planId: dto.planId,
      teamId: dto.teamId ?? null,
      workerName: dto.workerName,
      workDate: new Date(dto.workDate),
      qrCode: dto.qrCode ?? null,
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      overtimeHours: dto.overtimeHours ?? 0,
      workContent: dto.workContent ?? null,
      completionPercent: dto.completionPercent ?? 0,
      photoAttachments: dto.photoAttachments ?? null,
      source: 'pda',
      createdBy: userId,
    } as any);
    return this.reportRepo.save(entity) as unknown as InstallReport;
  }

  /** 日报汇总：按日期+班组查询当日进度 */
  async getDailyReport(date: string, teamId?: string): Promise<{
    date: string;
    teamId: string | null;
    totalWorkers: number;
    totalHours: number;
    totalOvertime: number;
    avgCompletionPercent: number;
    records: InstallReport[];
  }> {
    const targetDate = new Date(date);
    const qb = this.reportRepo.createQueryBuilder('ir')
      .where('ir.workDate = :date', { date: targetDate });

    if (teamId) {
      qb.andWhere('ir.teamId = :teamId', { teamId });
    }

    const records = await qb.orderBy('ir.createdAt', 'ASC').getMany();

    // 汇总统计
    const totalWorkers = records.filter((r, i, arr) => arr.findIndex(x => x.workerName === r.workerName) === i).length;
    let totalHours = 0;
    records.forEach((r) => {
      if (r.startTime && r.endTime) {
        const [sh, sm] = r.startTime.split(':').map(Number);
        const [eh, em] = r.endTime.split(':').map(Number);
        totalHours += (eh + em / 60) - (sh + sm / 60);
      }
    });
    const totalOvertime = records.reduce((sum, r) => sum + Number(r.overtimeHours ?? 0), 0);
    const avgCompletionPercent = records.length > 0
      ? records.reduce((sum, r) => sum + Number(r.completionPercent ?? 0), 0) / records.length
      : 0;

    return {
      date,
      teamId: teamId ?? null,
      totalWorkers,
      totalHours: Math.round(totalHours * 10) / 10,
      totalOvertime,
      avgCompletionPercent: Math.round(avgCompletionPercent * 10) / 10,
      records,
    };
  }

  /** 计算安装计划总成本：人工+差旅+住宿+工具+材料 */
  async calculateInstallCost(planId: string): Promise<{
    planId: string;
    laborFee: number;
    travelFee: number;
    accommodationFee: number;
    toolCost: number;
    materialCost: number;
    totalCost: number;
  }> {
    // 从安装报工记录汇总人工费（按小时估算，默认50元/小时）
    const reports = await this.reportRepo.find({ where: { planId: planId as any } });

    let totalLaborHours = 0;
    reports.forEach((r) => {
      if (r.startTime && r.endTime) {
        const [sh, sm] = r.startTime.split(':').map(Number);
        const [eh, em] = r.endTime.split(':').map(Number);
        totalLaborHours += (eh + em / 60) - (sh + sm / 60);
      }
    });
    const laborFee = Math.round(totalLaborHours * 50 * 100) / 100;

    // 其他费用默认从报工数据的关联信息估算
    // （实际对接 install-costs 模块的数据库查询，这里提供基础计算框架）
    const travelFee = 0;
    const accommodationFee = 0;
    const toolCost = 0;
    const materialCost = 0;
    const totalCost = Math.round((laborFee + travelFee + accommodationFee + toolCost + materialCost) * 100) / 100;

    return {
      planId,
      laborFee,
      travelFee,
      accommodationFee,
      toolCost,
      materialCost,
      totalCost,
    };
  }
}
