import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from './employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.empRepo.createQueryBuilder('e');
    if (keyword) {
      qb.andWhere('(e.code LIKE :kw OR e.name LIKE :kw OR e.phone LIKE :kw OR e.position LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('e.status = :status', { status });
    if (sortBy) qb.orderBy(`e.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('e.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Employee> {
    const emp = await this.empRepo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`员工 ${id} 不存在`);
    return emp;
  }

  async create(dto: CreateEmployeeDto, userId: string): Promise<Employee> {
    const count = await this.empRepo.count();
    const code = generateCode('employee', count + 1);
    const emp = this.empRepo.create({
      code,
      name: dto.name,
      gender: dto.gender,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      idNumber: dto.idNumber ?? undefined,
      phone: dto.phone ?? undefined,
      email: dto.email ?? undefined,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      departmentId: dto.departmentId ?? undefined,
      departmentName: dto.departmentName ?? undefined,
      position: dto.position ?? undefined,
      status: 'active' as EmployeeStatus,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.empRepo.save(emp);
  }

  async update(id: string, dto: UpdateEmployeeDto, userId: string): Promise<Employee> {
    const emp = await this.findOne(id);
    Object.assign(emp, dto, { updatedBy: userId });
    return this.empRepo.save(emp);
  }

  async remove(id: string): Promise<void> {
    const emp = await this.findOne(id);
    await this.empRepo.remove(emp);
  }

  async changeStatus(id: string, status: EmployeeStatus, userId: string): Promise<Employee> {
    const emp = await this.findOne(id);
    emp.status = status;
    emp.updatedBy = userId;
    if (status === 'resigned') {
      emp.resignDate = new Date();
    }
    return this.empRepo.save(emp);
  }
}
