import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessRoute } from './process-route.entity';
import { ProcessRouteStep } from './process-route-step.entity';

@Injectable()
export class ProcessRouteService {
  constructor(
    @InjectRepository(ProcessRoute)
    private readonly routeRepo: Repository<ProcessRoute>,
    @InjectRepository(ProcessRouteStep)
    private readonly stepRepo: Repository<ProcessRouteStep>,
  ) {}

  async findAll(shelfTypeId?: string): Promise<ProcessRoute[]> {
    const where = shelfTypeId ? { shelfTypeId } : {};
    const routes = await this.routeRepo.find({
      where,
      relations: ['steps'],
      order: { createdAt: 'DESC' },
    });
    // 按 sequence 排序 steps
    routes.forEach((r) => {
      if (r.steps) r.steps.sort((a, b) => a.sequence - b.sequence);
    });
    return routes;
  }

  async create(
    data: Partial<ProcessRoute> & { steps?: Partial<ProcessRouteStep>[] },
    userId: string,
  ): Promise<ProcessRoute> {
    const route = this.routeRepo.create({
      routeCode: data.routeCode,
      name: data.name,
      shelfTypeId: data.shelfTypeId,
      productPart: data.productPart ?? '',
      description: data.description ?? '',
      stdTotalHours: data.stdTotalHours ?? 0,
      isActive: data.isActive ?? true,
      createdBy: userId,
      updatedBy: userId,
    } as ProcessRoute);
    const saved = await this.routeRepo.save(route);

    if (data.steps && data.steps.length > 0) {
      const stepEntities = data.steps.map((s) =>
        this.stepRepo.create({
          routeId: saved.id,
          stepCode: s.stepCode,
          stepName: s.stepName,
          sequence: s.sequence ?? 0,
          equipmentType: s.equipmentType ?? '',
          equipmentCapacity: s.equipmentCapacity ?? '',
          standardMinutes: s.standardMinutes ?? 0,
          dependency: s.dependency ?? null,
          qualityKeyPoints: s.qualityKeyPoints ?? '',
          reportMethod: s.reportMethod ?? '',
          equipmentInterface: s.equipmentInterface ?? '',
        }),
      );
      saved.steps = await this.stepRepo.save(stepEntities);
    } else {
      saved.steps = [];
    }

    return saved;
  }
}
