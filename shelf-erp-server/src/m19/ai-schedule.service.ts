import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiScheduleResult } from './ai-schedule.entity';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

/**
 * M19 AI智能排产服务
 *
 * 使用优先级规则启发式算法模拟排产优化：
 *   优先级得分 = 交期紧迫度 × 0.5 + (1/加工时间) × 0.3 + 换线复杂度 × 0.2
 *
 * 实际部署时可替换为遗传算法 + 约束规划混合求解器（如 OR-Tools）。
 */
interface ProductionTask {
  id: string;
  name: string;
  processingTime: number;   // 加工时间（小时）
  dueDate: Date;            // 交期
  setupComplexity: number;  // 换线复杂度 (1-10)
  workCenterId?: string;    // 工作中心
}

interface ScheduledTask {
  taskId: string;
  taskName: string;
  startTime: number;       // 相对开始时间（小时）
  endTime: number;         // 相对结束时间（小时）
  workCenterId: string;
  setupTime: number;
}

interface ScheduleOutput {
  schedule: ScheduledTask[];
  makespan: number;
  equipmentUtilization: number;
  changeoverTime: number;
  totalTasks: number;
}

@Injectable()
export class AiScheduleService {
  constructor(
    @InjectRepository(AiScheduleResult)
    private readonly scheduleRepo: Repository<AiScheduleResult>,
  ) {}

  /**
   * 计算任务优先级得分
   */
  private computePriority(task: ProductionTask, now: Date): number {
    const hoursUntilDue = Math.max(
      0.1,
      (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60),
    );
    const urgency = 1 / hoursUntilDue; // 越临近交期越紧迫
    const processingInverse = 1 / Math.max(0.1, task.processingTime);
    const setupScore = (10 - task.setupComplexity) / 10; // 换线简单得分高

    return urgency * 0.5 + processingInverse * 0.3 + setupScore * 0.2;
  }

  /**
   * 估计换线准备时间（小时）
   */
  private estimateSetupTime(prev: ScheduledTask | null, next: ProductionTask): number {
    if (!prev) return 0.5;
    // 同工作中心无需换线，否则根据复杂度估算
    return next.setupComplexity * 0.3;
  }

  /**
   * 执行优先级规则排产
   */
  private runPriorityScheduling(tasks: ProductionTask[]): ScheduleOutput {
    if (tasks.length === 0) {
      return {
        schedule: [],
        makespan: 0,
        equipmentUtilization: 0,
        changeoverTime: 0,
        totalTasks: 0,
      };
    }

    const now = new Date();

    // 按优先级降序排列
    const sorted = [...tasks].sort(
      (a, b) => this.computePriority(b, now) - this.computePriority(a, now),
    );

    // 将任务分配到工作中心（简化：最多3个并行中心）
    const workCenters: ScheduledTask[][] = [[], [], []];
    const centerTimers: number[] = [0, 0, 0];

    let totalSetupTime = 0;
    let totalProcessingTime = 0;

    for (const task of sorted) {
      // 选当前最早完成的工作中心
      let bestCenter = 0;
      for (let i = 1; i < workCenters.length; i++) {
        if (centerTimers[i] < centerTimers[bestCenter]) {
          bestCenter = i;
        }
      }

      const prevTask =
        workCenters[bestCenter].length > 0
          ? workCenters[bestCenter][workCenters[bestCenter].length - 1]
          : null;

      const setupTime = this.estimateSetupTime(prevTask, task);
      totalSetupTime += setupTime;

      const startTime = centerTimers[bestCenter] + setupTime;
      const endTime = startTime + task.processingTime;

      const scheduled: ScheduledTask = {
        taskId: task.id,
        taskName: task.name,
        startTime,
        endTime,
        workCenterId: task.workCenterId ?? `WC${bestCenter + 1}`,
        setupTime,
      };

      workCenters[bestCenter].push(scheduled);
      centerTimers[bestCenter] = endTime;
      totalProcessingTime += task.processingTime;
    }

    // 计算 makespan = 所有中心最晚完成时间
    const makespan = Math.max(...centerTimers);

    // 设备利用率 = 总加工时间 / (makespan × 工作中心数)
    const equipmentUtilization =
      makespan > 0
        ? Math.min(1, totalProcessingTime / (makespan * workCenters.length)) * 100
        : 0;

    // 展平排程
    const schedule: ScheduledTask[] = [];
    for (let i = 0; i < workCenters.length; i++) {
      schedule.push(
        ...workCenters[i].map((t) => ({
          ...t,
          workCenterId: `WC${i + 1}`,
        })),
      );
    }

    // 按开始时间排序
    schedule.sort((a, b) => a.startTime - b.startTime);

    return {
      schedule,
      makespan: Math.round(makespan * 100) / 100,
      equipmentUtilization: Math.round(equipmentUtilization * 100) / 100,
      changeoverTime: Math.round(totalSetupTime * 100) / 100,
      totalTasks: tasks.length,
    };
  }

  /**
   * 主入口：对指定批次执行排产优化
   * @param batchId 生产批次ID
   * @param constraints 可选约束（如 shiftHours, workCenterCount）
   */
  async optimize(
    batchId: string,
    constraints?: Record<string, any>,
  ): Promise<AiScheduleResult> {
    // 模拟从批次中提取生产任务（实际应从 M10 生产模块读取）
    // 此处创建示例任务用于演示
    const mockTasks: ProductionTask[] = [
      {
        id: 'task-1',
        name: '立柱裁切',
        processingTime: 2.5,
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        setupComplexity: 3,
        workCenterId: 'WC1',
      },
      {
        id: 'task-2',
        name: '横梁冲孔',
        processingTime: 4.0,
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        setupComplexity: 5,
        workCenterId: 'WC2',
      },
      {
        id: 'task-3',
        name: '焊接组装',
        processingTime: 6.0,
        dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        setupComplexity: 7,
        workCenterId: 'WC1',
      },
      {
        id: 'task-4',
        name: '表面喷涂',
        processingTime: 3.0,
        dueDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
        setupComplexity: 4,
        workCenterId: 'WC3',
      },
      {
        id: 'task-5',
        name: '成品检验',
        processingTime: 1.5,
        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        setupComplexity: 1,
        workCenterId: 'WC3',
      },
      {
        id: 'task-6',
        name: '打包发货',
        processingTime: 2.0,
        dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        setupComplexity: 2,
        workCenterId: 'WC2',
      },
    ];

    const result = this.runPriorityScheduling(mockTasks);

    const scheduleResult = this.scheduleRepo.create({
      batchId,
      optimizedAt: new Date(),
      makespan: result.makespan,
      equipmentUtilization: result.equipmentUtilization,
      changeoverTime: result.changeoverTime,
      schedule: result.schedule as any,
      status: 'completed',
    } as any);

    return this.scheduleRepo.save(scheduleResult as unknown as AiScheduleResult);
  }

  /**
   * 根据批次ID获取排产结果
   */
  async getResult(batchId: string): Promise<AiScheduleResult> {
    const result = await this.scheduleRepo.findOne({
      where: { batchId },
      order: { optimizedAt: 'DESC' },
    });
    if (!result) {
      throw new NotFoundException(`批次 ${batchId} 的排产结果不存在`);
    }
    return result;
  }

  /**
   * 获取历史排产记录
   */
  async getHistory(dto: PaginationDto) {
    const { page = 1, pageSize = 20, sortBy, sortOrder } = dto;
    const qb = this.scheduleRepo.createQueryBuilder('sr');
    if (sortBy) {
      qb.orderBy(`sr.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    } else {
      qb.orderBy('sr.optimizedAt', 'DESC');
    }
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }
}
