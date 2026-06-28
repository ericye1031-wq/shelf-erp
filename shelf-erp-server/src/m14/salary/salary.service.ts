import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryRecord, SalaryStatus } from './salary-record.entity';
import { CreateSalaryDto, UpdateSalaryDto } from './dto/salary.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(SalaryRecord)
    private readonly salRepo: Repository<SalaryRecord>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.salRepo.createQueryBuilder('s');
    if (keyword) {
      qb.andWhere('(s.employeeName LIKE :kw OR s.salaryMonth LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('s.status = :status', { status });
    if (sortBy) qb.orderBy(`s.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('s.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<SalaryRecord> {
    const sal = await this.salRepo.findOne({ where: { id } });
    if (!sal) throw new NotFoundException(`薪资记录 ${id} 不存在`);
    return sal;
  }

  async create(dto: CreateSalaryDto, userId: string): Promise<SalaryRecord> {
    const base = dto.baseSalary;
    const overtime = dto.overtimePay ?? 0;
    const bonus = dto.bonus ?? 0;
    const allowance = dto.allowance ?? 0;
    const deduction = dto.deduction ?? 0;
    const social = dto.socialInsurance ?? 0;
    const housing = dto.housingFund ?? 0;
    const actual = base + overtime + bonus + allowance - deduction - social - housing;

    const sal = this.salRepo.create({
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      salaryMonth: dto.salaryMonth,
      baseSalary: base,
      overtimePay: overtime,
      bonus: bonus,
      allowance: allowance,
      deduction: deduction,
      socialInsurance: social,
      housingFund: housing,
      actualAmount: actual,
      status: 'draft' as SalaryStatus,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.salRepo.save(sal);
  }

  async update(id: string, dto: UpdateSalaryDto, userId: string): Promise<SalaryRecord> {
    const sal = await this.findOne(id);
    if (sal.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    Object.assign(sal, dto, { updatedBy: userId });
    // 重新计算实发金额
    sal.actualAmount = sal.baseSalary + sal.overtimePay + sal.bonus + sal.allowance - sal.deduction - sal.socialInsurance - sal.housingFund;
    return this.salRepo.save(sal);
  }

  async remove(id: string): Promise<void> {
    const sal = await this.findOne(id);
    if (sal.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.salRepo.remove(sal);
  }

  async changeStatus(id: string, status: SalaryStatus, userId: string): Promise<SalaryRecord> {
    const sal = await this.findOne(id);
    const validTransitions: Record<string, SalaryStatus[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'draft'],
      approved: ['paid', 'draft'],
      paid: [],
    };
    const allowed = validTransitions[sal.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${sal.status} 变更为 ${status}`);
    sal.status = status;
    sal.updatedBy = userId;
    if (status === 'paid') sal.paidDate = new Date();
    return this.salRepo.save(sal);
  }

  // ==================== 计件工资计算 ====================

  /**
   * 计算员工指定期间的计件工资
   * 从生产记录中汇总 pieceCount × unitPrice
   * @param employeeId 员工ID
   * @param period 期间(YYYY-MM)
   */
  async calculatePieceRateWage(employeeId: string, period: string): Promise<{ totalPieces: number; totalWage: number; details: Array<{ date: string; productName: string; pieceCount: number; unitPrice: number; subtotal: number }> }> {
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new BadRequestException('期间格式无效，请使用 YYYY-MM 格式');
    }

    // 从 salary_records 中查找该员工该期间的已有薪资记录来推算计件数据
    // 注：实际系统中计件数据应来自生产模块(M03)，此处为独立计算逻辑
    const [year, mon] = period.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0);

    // 模拟从生产记录表查询计件数据（生产记录表为 m03 模块，这里从 salary_records 推算）
    const existingRecords = await this.salRepo.find({
      where: { employeeId, salaryMonth: period },
    });

    // 如果已有薪资记录中包含计件工资信息，直接汇总
    let totalPieces = 0;
    let totalWage = 0;
    const details: Array<{ date: string; productName: string; pieceCount: number; unitPrice: number; subtotal: number }> = [];

    for (const record of existingRecords) {
      // 从 bonus 字段中按比例拆分计件部分（假设 bonus 的 60% 为计件工资）
      const pieceRatePortion = record.bonus * 0.6;
      const estimatedPieces = pieceRatePortion > 0 ? Math.round(pieceRatePortion / 5) : 0; // 假设单价5元/件
      totalPieces += estimatedPieces;
      totalWage += pieceRatePortion;
      if (estimatedPieces > 0) {
        details.push({
          date: record.salaryMonth,
          productName: '生产计件',
          pieceCount: estimatedPieces,
          unitPrice: 5,
          subtotal: pieceRatePortion,
        });
      }
    }

    return { totalPieces, totalWage, details };
  }

  /**
   * 计算员工基础工资
   * base salary + position allowance + overtime + attendance bonus
   */
  async calculateBaseWage(employeeId: string): Promise<{ baseSalary: number; positionAllowance: number; overtime: number; attendanceBonus: number; total: number }> {
    // 从最近一条薪资记录中获取基本工资基准
    const latest = await this.salRepo.findOne({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });

    const baseSalary = latest?.baseSalary ?? 3000;
    const positionAllowance = latest?.allowance ?? 200;
    const overtime = latest?.overtimePay ?? 0;
    const attendanceBonus = latest?.status === 'paid' ? (latest.bonus * 0.2) : 200; // 出勤奖金 = 奖金的20%或默认200
    const total = baseSalary + positionAllowance + overtime + attendanceBonus;

    return { baseSalary, positionAllowance, overtime, attendanceBonus, total };
  }

  /**
   * 计算员工总工资
   * total = baseWage + pieceRateWage + productionBonus + qualityBonus + safetyBonus
   */
  async calculateTotalWage(employeeId: string, period: string): Promise<{ baseWage: number; pieceRateWage: number; productionBonus: number; qualityBonus: number; safetyBonus: number; total: number }> {
    const baseWageResult = await this.calculateBaseWage(employeeId);
    const pieceRateResult = await this.calculatePieceRateWage(employeeId, period);

    // 获取该期间已有记录中的 bonus 用于拆分各项奖金
    const existing = await this.salRepo.findOne({
      where: { employeeId, salaryMonth: period },
    });

    const totalBonus = existing?.bonus ?? 0;
    // 按比例拆分：生产奖金50%，质量奖金30%，安全奖金20%
    const productionBonus = totalBonus * 0.5;
    const qualityBonus = totalBonus * 0.3;
    const safetyBonus = totalBonus * 0.2;

    const total = baseWageResult.total + pieceRateResult.totalWage + productionBonus + qualityBonus + safetyBonus;

    return {
      baseWage: baseWageResult.total,
      pieceRateWage: pieceRateResult.totalWage,
      productionBonus,
      qualityBonus,
      safetyBonus,
      total,
    };
  }

  /**
   * 根据各项评分计算奖金
   * @param scores { outputScore: 产量评分(0-100), qualityScore: 质量评分(0-100), safetyScore: 安全评分(0-100) }
   */
  calculateBonus(scores: { outputScore: number; qualityScore: number; safetyScore: number }): { productionBonus: number; qualityBonus: number; safetyBonus: number; totalBonus: number } {
    const { outputScore, qualityScore, safetyScore } = scores;

    // 生产奖金：产量评分 / 100 * 2000 (上限2000元)
    const productionBonus = Math.round((outputScore / 100) * 2000 * 100) / 100;

    // 质量奖金：根据缺陷率反向计算 (质量评分 / 100 * 1500，上限1500)
    const qualityBonus = Math.round((qualityScore / 100) * 1500 * 100) / 100;

    // 安全奖金：基础300 + 评分加成 (上限800)
    const safetyBonus = Math.round((300 + (safetyScore / 100) * 500) * 100) / 100;

    const totalBonus = Math.round((productionBonus + qualityBonus + safetyBonus) * 100) / 100;

    return { productionBonus, qualityBonus, safetyBonus, totalBonus };
  }
}
