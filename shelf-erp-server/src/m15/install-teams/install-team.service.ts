import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallTeam, WorkerRole, CertStatus, InsuranceStatus } from './install-team.entity';
import { CreateInstallTeamDto } from './dto/install-team.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class InstallTeamService {
  constructor(
    @InjectRepository(InstallTeam)
    private readonly teamRepo: Repository<InstallTeam>,
  ) {}

  async findByPlanId(planId: string): Promise<InstallTeam[]> {
    return this.teamRepo.find({ where: { planId }, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<InstallTeam> {
    const team = await this.teamRepo.findOne({ where: { id } });
    if (!team) throw new NotFoundException(`安装人员 ${id} 不存在`);
    return team;
  }

  async create(dto: CreateInstallTeamDto, userId: string): Promise<InstallTeam> {
    const entity = this.teamRepo.create({
      planId: dto.planId,
      workerName: dto.workerName,
      workerRole: dto.workerRole as WorkerRole,
      certStatus: dto.certStatus as CertStatus,
      insuranceStatus: dto.insuranceStatus as InsuranceStatus,
      createdBy: userId,
    });
    return this.teamRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.teamRepo.remove(entity);
  }
}
