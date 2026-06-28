import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ShiftSchedule, ShiftStatus, ShiftType } from './shift-schedule.entity';
import { CreateShiftScheduleDto, UpdateShiftScheduleDto } from './dto/shift-schedule.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ShiftScheduleService {
  constructor(
    @InjectRepository(ShiftSchedule)
    private readonly shiftRepo: Repository<ShiftSchedule>,
  ) {}

  // ==================== CRUD ====================

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.shiftRepo.createQueryBuilder('s');
    if (keyword) {
      qb.andWhere('(s.employeeName LIKE :kw OR s.shiftType LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('s.status = :status', { status });
    if (sortBy) qb.orderBy(`s.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('s.scheduleDate', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<ShiftSchedule> {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) throw new NotFoundException(`排班记录 ${id} 不存在`);
    return shift;
  }

  async create(dto: CreateShiftScheduleDto, userId: string): Promise<ShiftSchedule> {
    const shift = this.shiftRepo.create({
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      departmentId: dto.departmentId ?? undefined,
      shiftType: dto.shiftType,
      scheduleDate: new Date(dto.scheduleDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: 'scheduled' as ShiftStatus,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.shiftRepo.save(shift);
  }

  async update(id: string, dto: UpdateShiftScheduleDto, userId: string): Promise<ShiftSchedule> {
    const shift = await this.findOne(id);
    Object.assign(shift, dto, {
      scheduleDate: dto.scheduleDate ? new Date(dto.scheduleDate) : shift.scheduleDate,
      updatedBy: userId,
    });
    return this.shiftRepo.save(shift);
  }

  async remove(id: string): Promise<void> {
    const shift = await this.findOne(id);
    await this.shiftRepo.remove(shift);
  }

  // ==================== 业务方法 ====================

  /**
   * 为指定部门自动生成一周排班
   * 规则：交替安排白班(day)和夜班(night)，默认时间：白班 08:00-16:00，夜班 16:00-24:00
   */
  async generateWeeklySchedule(
    departmentId: string,
    weekStart: string,
    userId: string,
  ): Promise<{ generated: number; message: string }> {
    const startDate = new Date(weekStart);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('weekStart 日期格式无效，请使用 YYYY-MM-DD 格式');
    }

    // 获取该部门一周内已有排班的员工ID集合
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const existingShifts = await this.shiftRepo.find({
      where: {
        departmentId,
        scheduleDate: Between(startDate, weekEnd),
      },
    });

    const existingEmployeeDates = new Set(
      existingShifts.map((s) => `${s.employeeId}_${s.scheduleDate.toISOString().slice(0, 10)}`),
    );

    // 获取该部门员工（通过 EmployeeService 查询 — 这里使用简化的查询方式，假设部门员工通过已有排班数据库推断）
    const deptEmployees = await this.shiftRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.employeeId', 'employeeId')
      .addSelect('s.employeeName', 'employeeName')
      .where('s.departmentId = :departmentId', { departmentId })
      .getRawMany<{ employeeId: string; employeeName: string }>();

    if (deptEmployees.length === 0) {
      // 新部门无历史数据，仍允许生成但不创建记录
      return { generated: 0, message: '该部门暂无历史排班数据，无法确定部门员工列表' };
    }

    const newShifts: ShiftSchedule[] = [];
    let generated = 0;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().slice(0, 10);

      for (let j = 0; j < deptEmployees.length; j++) {
        const emp = deptEmployees[j];
        const key = `${emp.employeeId}_${dateStr}`;
        if (existingEmployeeDates.has(key)) continue;

        // 轮流分配班次类型
        const shiftType: ShiftType = (j % 2 === 0) ? 'day' : 'night';
        const startTime = shiftType === 'day' ? '08:00' : '16:00';
        const endTime = shiftType === 'day' ? '16:00' : '24:00';

        newShifts.push(
          this.shiftRepo.create({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            departmentId,
            shiftType,
            scheduleDate: currentDate,
            startTime,
            endTime,
            status: 'scheduled' as ShiftStatus,
            createdBy: userId,
            updatedBy: userId,
          }),
        );
        generated++;
      }
    }

    if (newShifts.length > 0) {
      await this.shiftRepo.save(newShifts);
    }

    return {
      generated,
      message: `成功为 ${deptEmployees.length} 名员工生成 ${generated} 条排班记录`,
    };
  }

  /**
   * 按日期范围查询排班
   */
  async getScheduleByDateRange(startDate: string, endDate: string, departmentId?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('日期格式无效，请使用 YYYY-MM-DD 格式');
    }

    const where: any = {
      scheduleDate: Between(start, end),
    };
    if (departmentId) where.departmentId = departmentId;

    return this.shiftRepo.find({ where, order: { scheduleDate: 'ASC' } });
  }

  /**
   * 获取员工某月排班
   */
  async getEmployeeSchedule(employeeId: string, month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('月份格式无效，请使用 YYYY-MM 格式');
    }
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0); // 该月最后一天

    return this.shiftRepo.find({
      where: {
        employeeId,
        scheduleDate: Between(startDate, endDate),
      },
      order: { scheduleDate: 'ASC' },
    });
  }
}
