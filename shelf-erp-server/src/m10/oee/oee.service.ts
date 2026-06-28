import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OeeData } from './oee.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

export interface OeeCalculation {
  date: string;
  equipmentId: string;
  equipmentName: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  plannedTime: number;
  runTime: number;
  downtime: number;
  idealCycle: number;
  actualCycle: number;
  totalOutput: number;
  goodOutput: number;
  defectOutput: number;
}

export interface OeeTrend {
  date: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export interface SixBigLosses {
  breakdownLoss: number;
  setupAdjustLoss: number;
  idleMinorStopLoss: number;
  reducedSpeedLoss: number;
  startupRejectLoss: number;
  productionRejectLoss: number;
}

@Injectable()
export class OeeService {
  constructor(
    @InjectRepository(OeeData)
    private readonly repo: Repository<OeeData>,
  ) {}

  async findAll(dto: PaginationDto & { equipmentId?: string; date?: string }) {
    const { page = 1, pageSize = 20, equipmentId, date } = dto;
    const qb = this.repo.createQueryBuilder('oee');
    if (equipmentId) qb.andWhere('oee.equipmentId = :eqId', { eqId: equipmentId });
    if (date) qb.andWhere('oee.date = :date', { date });
    qb.orderBy('oee.date', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  /**
   * 计算单条OEE记录
   * OEE = 时间开动率 × 性能开动率 × 合格品率
   * SRS §9.3 MES功能清单 - OEE分析
   */
  calculate(
    plannedTime: number,   // 计划运行时间 (min)
    runTime: number,       // 实际运行时间 (min)
    idealCycle: number,    // 理想节拍 (min/pc)
    actualCycle: number,   // 实际节拍 (min/pc)
    totalOutput: number,   // 总产量 (pcs)
    goodOutput: number,    // 合格品数 (pcs)
  ): OeeCalculation {
    // 时间开动率 = 运行时间 / 计划时间
    const availability = plannedTime > 0 ? runTime / plannedTime : 0;

    // 性能开动率 = (理想节拍 × 总产量) / 运行时间
    const performance =
      runTime > 0 ? (idealCycle * totalOutput) / runTime : 0;

    // 合格品率 = 合格品 / 总产量
    const quality = totalOutput > 0 ? goodOutput / totalOutput : 0;

    // OEE
    const oee = availability * performance * quality;

    return {
      availability,
      performance,
      quality,
      oee,
      plannedTime,
      runTime,
      downtime: plannedTime - runTime,
      idealCycle,
      actualCycle,
      totalOutput,
      goodOutput,
      defectOutput: totalOutput - goodOutput,
      equipmentId: '',
      equipmentName: '',
      date: '',
    };
  }

  /**
   * 创建并自动计算OEE
   */
  async createWithCalc(data: {
    equipmentId: string;
    equipmentName: string;
    date: string;
    plannedTime: number;
    runTime: number;
    idealCycle: number;
    actualCycle: number;
    totalOutput: number;
    goodOutput: number;
  }): Promise<OeeData> {
    const calc = this.calculate(
      data.plannedTime,
      data.runTime,
      data.idealCycle,
      data.actualCycle,
      data.totalOutput,
      data.goodOutput,
    );

    const entity = this.repo.create({
      ...data,
      availability: calc.availability,
      performance: calc.performance,
      quality: calc.quality,
      oee: calc.oee,
    });
    return this.repo.save(entity);
  }

  /**
   * 获取设备OEE趋势（按日期）
   */
  async getTrend(
    equipmentId: string,
    startDate: string,
    endDate: string,
  ): Promise<OeeTrend[]> {
    const data = await this.repo.find({
      where: {
        equipmentId,
        date: Between(startDate, endDate) as any,
      },
      order: { date: 'ASC' },
    });

    return data.map((d) => ({
      date: d.date,
      availability: Number(d.availability),
      performance: Number(d.performance),
      quality: Number(d.quality),
      oee: Number(d.oee),
    }));
  }

  /**
   * 获取总体OEE汇总（可按设备/日期范围筛选）
   */
  async getSummary(
    equipmentId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<OeeCalculation & { count: number }> {
    const qb = this.repo.createQueryBuilder('oee');
    if (equipmentId) qb.andWhere('oee.equipmentId = :eqId', { eqId: equipmentId });
    if (startDate) qb.andWhere('oee.date >= :start', { start: startDate });
    if (endDate) qb.andWhere('oee.date <= :end', { end: endDate });

    const items = await qb.getMany();
    const count = items.length;

    if (count === 0) {
      return {
        date: '',
        equipmentId: equipmentId ?? '',
        equipmentName: '',
        availability: 0,
        performance: 0,
        quality: 0,
        oee: 0,
        plannedTime: 0,
        runTime: 0,
        downtime: 0,
        idealCycle: 0,
        actualCycle: 0,
        totalOutput: 0,
        goodOutput: 0,
        defectOutput: 0,
        count: 0,
      };
    }

    // 加权平均
    const totalPlanned = items.reduce((s, i) => s + Number(i.plannedTime), 0);
    const totalRun = items.reduce((s, i) => s + Number(i.runTime), 0);
    const totalOutput = items.reduce((s, i) => s + i.totalOutput, 0);
    const totalGood = items.reduce((s, i) => s + i.goodOutput, 0);
    const totalIdealCycle = items.reduce((s, i) => s + Number(i.idealCycle), 0);
    const totalActualCycle = items.reduce((s, i) => s + Number(i.actualCycle), 0);

    const calc = this.calculate(
      totalPlanned,
      totalRun,
      totalIdealCycle / count,
      totalActualCycle / count,
      totalOutput,
      totalGood,
    );

    return {
      ...calc,
      equipmentId: equipmentId ?? items[0]?.equipmentId ?? '',
      equipmentName: items[0]?.equipmentName ?? '',
      count,
    };
  }

  /**
   * SRS §9.3 OEE 六大损失分析
   * 世界级OEE基准: Availability ≥ 90%, Performance ≥ 95%, Quality ≥ 99.9%
   */
  analyzeSixBigLosses(
    plannedTime: number,
    runTime: number,
    idealCycle: number,
    actualCycle: number,
    totalOutput: number,
    goodOutput: number,
    breakdownTime: number,
    setupTime: number,
    minorStopCount: number,
    avgStopDuration: number,
    startupRejects: number,
    productionRejects: number,
  ): SixBigLosses {
    const downtime = plannedTime - runTime;

    return {
      // 设备故障损失 = 故障时间 / 计划时间
      breakdownLoss: plannedTime > 0 ? breakdownTime / plannedTime : 0,
      // 换模调整损失 = 调整时间 / 计划时间
      setupAdjustLoss: plannedTime > 0 ? setupTime / plannedTime : 0,
      // 空转暂停损失 = 小停机次数 × 平均时长 / 运行时间
      idleMinorStopLoss:
        runTime > 0 ? (minorStopCount * avgStopDuration) / runTime : 0,
      // 速度降低损失
      reducedSpeedLoss:
        runTime > 0
          ? (runTime - idealCycle * totalOutput) / runTime
          : 0,
      // 启动废品损失
      startupRejectLoss: totalOutput > 0 ? startupRejects / totalOutput : 0,
      // 过程废品损失
      productionRejectLoss: totalOutput > 0 ? productionRejects / totalOutput : 0,
    };
  }
}
