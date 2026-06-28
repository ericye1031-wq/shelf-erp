import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { add, multiply } from 'mathjs';
import { InstallCost } from './install-cost.entity';
import { CreateInstallCostDto, UpdateInstallCostDto } from './dto/install-cost.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class InstallCostService {
  constructor(
    @InjectRepository(InstallCost)
    private readonly costRepo: Repository<InstallCost>,
  ) {}

  calcTotal(dto: { laborFee?: number; travelFee?: number; accommodationFee?: number; toolCost?: number; materialCost?: number }): number {
    return Number(add(
      dto.laborFee ?? 0,
      dto.travelFee ?? 0,
      dto.accommodationFee ?? 0,
      dto.toolCost ?? 0,
      dto.materialCost ?? 0,
    ));
  }

  async findByPlanId(planId: string): Promise<InstallCost[]> {
    return this.costRepo.find({ where: { planId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<InstallCost> {
    const cost = await this.costRepo.findOne({ where: { id } });
    if (!cost) throw new NotFoundException(`成本记录 ${id} 不存在`);
    return cost;
  }

  async create(dto: CreateInstallCostDto, userId: string): Promise<InstallCost> {
    const laborFee = dto.laborFee ?? 0;
    const travelFee = dto.travelFee ?? 0;
    const accommodationFee = dto.accommodationFee ?? 0;
    const toolCost = dto.toolCost ?? 0;
    const materialCost = dto.materialCost ?? 0;
    const totalCost = this.calcTotal({ laborFee, travelFee, accommodationFee, toolCost, materialCost });

    const entity = this.costRepo.create({
      planId: dto.planId,
      laborFee,
      travelFee,
      accommodationFee,
      toolCost,
      materialCost,
      totalCost,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.costRepo.save(entity);
  }

  async update(id: string, dto: UpdateInstallCostDto, userId: string): Promise<InstallCost> {
    const cost = await this.findOne(id);
    const laborFee = dto.laborFee ?? cost.laborFee;
    const travelFee = dto.travelFee ?? cost.travelFee;
    const accommodationFee = dto.accommodationFee ?? cost.accommodationFee;
    const toolCost = dto.toolCost ?? cost.toolCost;
    const materialCost = dto.materialCost ?? cost.materialCost;
    const totalCost = this.calcTotal({ laborFee, travelFee, accommodationFee, toolCost, materialCost });
    cost.laborFee = laborFee;
    cost.travelFee = travelFee;
    cost.accommodationFee = accommodationFee;
    cost.toolCost = toolCost;
    cost.materialCost = materialCost;
    cost.totalCost = totalCost;
    cost.updatedBy = userId;
    return this.costRepo.save(cost);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.costRepo.remove(entity);
  }
}
