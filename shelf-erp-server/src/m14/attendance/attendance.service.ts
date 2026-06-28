import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attRepo: Repository<AttendanceRecord>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.attRepo.createQueryBuilder('a');
    if (keyword) {
      qb.andWhere('(a.employeeName LIKE :kw OR a.employeeId LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('a.status = :status', { status });
    if (sortBy) qb.orderBy(`a.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('a.recordDate', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const att = await this.attRepo.findOne({ where: { id } });
    if (!att) throw new NotFoundException(`考勤记录 ${id} 不存在`);
    return att;
  }

  async create(dto: CreateAttendanceDto, userId: string): Promise<AttendanceRecord> {
    const att = this.attRepo.create({
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      recordDate: new Date(dto.recordDate),
      clockIn: dto.clockIn ?? undefined,
      clockOut: dto.clockOut ?? undefined,
      status: dto.status,
      leaveType: dto.leaveType ?? undefined,
      overtimeHours: dto.overtimeHours ?? undefined,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.attRepo.save(att);
  }

  async update(id: string, dto: UpdateAttendanceDto, userId: string): Promise<AttendanceRecord> {
    const att = await this.findOne(id);
    Object.assign(att, dto, { updatedBy: userId });
    return this.attRepo.save(att);
  }

  async remove(id: string): Promise<void> {
    const att = await this.findOne(id);
    await this.attRepo.remove(att);
  }
}
