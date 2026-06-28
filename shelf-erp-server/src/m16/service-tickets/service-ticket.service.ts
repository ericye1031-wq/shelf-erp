import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceTicket } from './service-ticket.entity';
import { CreateServiceTicketDto, UpdateServiceTicketDto } from './dto/service-ticket.dto';

/** 工程师能力项 */
export interface EngineerProfile {
  id: string;
  name: string;
  region: string;
  skills: string[];
  currentLoad: number;
}

/** 服务统计 */
export interface ServiceStats {
  totalCount: number;
  pendingCount: number;
  assignedCount: number;
  processingCount: number;
  resolvedCount: number;
  closedCount: number;
  cancelledCount: number;
  avgResponseTimeHours: number | null;
  avgResolutionTimeHours: number | null;
}

/** 质保状态 */
export interface WarrantyStatusResult {
  isUnderWarranty: boolean;
  warrantyId: string | null;
  warrantyNo: string | null;
  startDate: string | null;
  endDate: string | null;
  warrantyType: string | null;
  daysRemaining: number | null;
}

@Injectable()
export class ServiceTicketService {
  constructor(
    @InjectRepository(ServiceTicket)
    private readonly repo: Repository<ServiceTicket>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, status } = query;
    const qb = this.repo.createQueryBuilder('t');

    if (keyword) {
      qb.andWhere('t.title LIKE :kw OR t.ticketNo LIKE :kw', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('t.status = :status', { status });

    qb.orderBy('t.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return {
      data: items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<ServiceTicket> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`服务工单 ${id} 不存在`);
    return entity;
  }

  async create(dto: CreateServiceTicketDto): Promise<ServiceTicket> {
    const ticketNo = `SVC${Date.now()}`;
    const entity = new ServiceTicket();
    Object.assign(entity, {
      ...dto,
      ticketNo,
      status: 'pending',
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateServiceTicketDto): Promise<ServiceTicket> {
    const entity = await this.findOne(id);
    // 状态变更为resolved时自动记录解决时间
    if (dto.status === 'resolved' && entity.status !== 'resolved') {
      entity.resolvedAt = new Date();
    }
    // 状态变更为assigned时自动记录分配时间
    if (dto.status === 'assigned' && !entity.assignedAt) {
      entity.assignedAt = new Date();
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  // ========== 新增方法 ==========

  /**
   * 自动派工：根据服务类型和区域，结合工程师技能和当前负载，自动分配
   * MVP阶段使用模拟工程师池 + 优先级规则
   */
  async autoDispatch(
    serviceType: string,
    region: string,
  ): Promise<{ ticket: ServiceTicket | null; message: string }> {
    // 模拟工程师池（实际应从 m16_engineers 表查询）
    const engineers: EngineerProfile[] = [
      { id: 'eng-001', name: '张工', region: '华东', skills: ['repair', 'install'], currentLoad: 3 },
      { id: 'eng-002', name: '李工', region: '华东', skills: ['maintain', 'consult'], currentLoad: 5 },
      { id: 'eng-003', name: '王工', region: '华南', skills: ['repair', 'maintain'], currentLoad: 2 },
      { id: 'eng-004', name: '赵工', region: '华南', skills: ['install', 'consult'], currentLoad: 1 },
      { id: 'eng-005', name: '刘工', region: '华北', skills: ['repair', 'install', 'maintain'], currentLoad: 4 },
    ];

    // 找到匹配该区域和技能的待分配工单
    const pendingTicket = await this.repo
      .createQueryBuilder('t')
      .where('t.status = :status', { status: 'pending' })
      .andWhere('t.serviceType = :serviceType', { serviceType })
      .andWhere('t.region = :region', { region })
      .orderBy('t.priority', 'DESC')
      .addOrderBy('t.createdAt', 'ASC')
      .getOne();

    if (!pendingTicket) {
      return { ticket: null, message: `没有找到区域[${region}]内服务类型[${serviceType}]的待分配工单` };
    }

    // 按技能匹配 + 负载最低排序选最优工程师
    const candidates = engineers
      .filter((e) => e.region === region && e.skills.includes(serviceType))
      .sort((a, b) => a.currentLoad - b.currentLoad);

    if (candidates.length === 0) {
      return { ticket: pendingTicket, message: `区域[${region}]内没有具备[${serviceType}]技能的工程师` };
    }

    const bestEngineer = candidates[0];

    // 分配工单
    pendingTicket.assignedTo = bestEngineer.id;
    pendingTicket.assignedToName = bestEngineer.name;
    pendingTicket.status = 'assigned';
    pendingTicket.assignedAt = new Date();
    await this.repo.save(pendingTicket);

    return {
      ticket: pendingTicket,
      message: `工单 ${pendingTicket.ticketNo} 已自动分配给 ${bestEngineer.name}(${bestEngineer.region})`,
    };
  }

  /**
   * 获取与某个项目关联的所有服务工单
   */
  async getByProject(projectId: string): Promise<ServiceTicket[]> {
    return this.repo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 判断项目是否在质保期内
   * 基于 warranties 表查询（同一个库表），如果 warranties 不可用则基于创建时间推算
   */
  async checkWarrantyStatus(projectId: string): Promise<WarrantyStatusResult> {
    // 尝试从 warranties 表查询
    let warranty: any = null;
    try {
      warranty = await this.repo.manager.query(
        `SELECT w.id, w.warranty_no, w.start_date, w.end_date, w.warranty_type 
         FROM m16_warranties w 
         WHERE w.product_id = ? AND w.status = 'active' 
         ORDER BY w.end_date DESC LIMIT 1`,
        [projectId],
      );
    } catch {
      // warranties 表可能不存在
    }

    if (warranty && warranty.length > 0) {
      const w = warranty[0];
      const endDate = new Date(w.end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        isUnderWarranty: daysRemaining > 0,
        warrantyId: w.id,
        warrantyNo: w.warranty_no,
        startDate: w.start_date,
        endDate: w.end_date,
        warrantyType: w.warranty_type,
        daysRemaining: Math.max(daysRemaining, 0),
      };
    }

    // 回退：基于项目下工单创建时间推算默认1年质保
    const tickets = await this.repo.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
      take: 1,
    });

    if (tickets.length === 0) {
      return {
        isUnderWarranty: false,
        warrantyId: null,
        warrantyNo: null,
        startDate: null,
        endDate: null,
        warrantyType: null,
        daysRemaining: null,
      };
    }

    const firstTicketDate = new Date(tickets[0].createdAt);
    const warrantyEnd = new Date(firstTicketDate);
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 1);
    const now = new Date();
    const daysRemaining = Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isUnderWarranty: daysRemaining > 0,
      warrantyId: null,
      warrantyNo: null,
      startDate: firstTicketDate.toISOString().split('T')[0],
      endDate: warrantyEnd.toISOString().split('T')[0],
      warrantyType: 'full',
      daysRemaining: Math.max(daysRemaining, 0),
    };
  }

  /**
   * 服务统计：按状态统计 + 平均响应时间 + 平均解决时间
   */
  async getServiceStats(): Promise<ServiceStats> {
    const [total, pending, assigned, processing, resolved, closed, cancelled] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: 'pending' as any } }),
      this.repo.count({ where: { status: 'assigned' as any } }),
      this.repo.count({ where: { status: 'processing' as any } }),
      this.repo.count({ where: { status: 'resolved' as any } }),
      this.repo.count({ where: { status: 'closed' as any } }),
      this.repo.count({ where: { status: 'cancelled' as any } }),
    ]);

    // 平均响应时间：assignedAt - createdAt（小时）
    const responseStats = await this.repo
      .createQueryBuilder('t')
      .select('AVG(EXTRACT(EPOCH FROM (t.assignedAt::timestamp - t.createdAt::timestamp)) / 3600)', 'avgHours')
      .where('t.assignedAt IS NOT NULL')
      .getRawOne();

    // 平均解决时间：resolvedAt - assignedAt（小时）
    const resolutionStats = await this.repo
      .createQueryBuilder('t')
      .select('AVG(EXTRACT(EPOCH FROM (t.resolvedAt::timestamp - t.assignedAt::timestamp)) / 3600)', 'avgHours')
      .where('t.resolvedAt IS NOT NULL AND t.assignedAt IS NOT NULL')
      .getRawOne();

    return {
      totalCount: total,
      pendingCount: pending,
      assignedCount: assigned,
      processingCount: processing,
      resolvedCount: resolved,
      closedCount: closed,
      cancelledCount: cancelled,
      avgResponseTimeHours: responseStats?.avgHours ? parseFloat(responseStats.avgHours) : null,
      avgResolutionTimeHours: resolutionStats?.avgHours ? parseFloat(resolutionStats.avgHours) : null,
    };
  }

  /**
   * 客户评价：提交满意度评分（1-5）和评论
   */
  async submitCustomerRating(
    ticketId: string,
    rating: number,
    comment?: string,
  ): Promise<ServiceTicket> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('评分必须在1-5之间');
    }

    const entity = await this.findOne(ticketId);

    if (entity.status !== 'resolved' && entity.status !== 'closed') {
      throw new BadRequestException('只能对已解决或已关闭的工单进行评价');
    }

    entity.satisfactionScore = rating;
    entity.satisfactionComment = comment || '';
    return this.repo.save(entity);
  }
}
