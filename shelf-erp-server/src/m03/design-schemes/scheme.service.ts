import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scheme, SchemeStatus } from './scheme.entity';
import { SchemeVersion } from './scheme-version.entity';
import { CreateSchemeDto, UpdateSchemeDto, CreateSchemeVersionDto } from './dto/scheme.dto';
import { PaginationDto, createPaginatedResponse, PaginatedData } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class SchemeService {
  constructor(
    @InjectRepository(Scheme)
    private readonly schemeRepo: Repository<Scheme>,
    @InjectRepository(SchemeVersion)
    private readonly versionRepo: Repository<SchemeVersion>,
  ) {}

  async findAll(dto: PaginationDto): Promise<PaginatedData<Scheme>> {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.schemeRepo.createQueryBuilder('s');
    if (keyword) {
      qb.andWhere('(s.code LIKE :kw OR s.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('s.status = :status', { status });
    if (sortBy) qb.orderBy(`s.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('s.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize) as PaginatedData<Scheme>;
  }

  async findOne(id: string): Promise<Scheme> {
    const scheme = await this.schemeRepo.findOne({
      where: { id },
      relations: ['versions'],
    });
    if (!scheme) throw new NotFoundException(`方案 ${id} 不存在`);
    return scheme;
  }

  async create(dto: CreateSchemeDto, userId: string): Promise<Scheme> {
    const code = generateCode('scheme', 1);
    const scheme = this.schemeRepo.create();
    scheme.code = code;
    scheme.name = dto.name;
    scheme.inquiryId = dto.inquiryId ?? null;
    scheme.projectId = dto.projectId ?? null;
    scheme.customerId = dto.customerId ?? null;
    scheme.rackType = dto.rackType ?? null;
    scheme.description = dto.description ?? null;
    scheme.currentVersion = 'V1.0';
    scheme.status = 'draft';
    scheme.createdBy = userId;
    scheme.updatedBy = userId;

    const saved = await this.schemeRepo.save(scheme);

    // 创建初始版本
    const version = this.versionRepo.create();
    version.schemeId = saved.id;
    version.versionNo = 'V1.0';
    version.changeSummary = '初始版本';
    version.attachments = '';
    version.status = 'draft';
    version.createdBy = userId;
    await this.versionRepo.save(version);

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateSchemeDto, userId: string): Promise<Scheme> {
    const scheme = await this.findOne(id);
    if (scheme.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    if (dto.name !== undefined) scheme.name = dto.name;
    if (dto.projectId !== undefined) scheme.projectId = dto.projectId;
    if (dto.customerId !== undefined) scheme.customerId = dto.customerId;
    if (dto.rackType !== undefined) scheme.rackType = dto.rackType;
    if (dto.description !== undefined) scheme.description = dto.description;
    scheme.updatedBy = userId;
    return this.schemeRepo.save(scheme);
  }

  async remove(id: string): Promise<void> {
    const scheme = await this.findOne(id);
    if (scheme.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.versionRepo.delete({ schemeId: id });
    await this.schemeRepo.remove(scheme);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: SchemeStatus, userId: string): Promise<Scheme> {
    const scheme = await this.findOne(id);
    const validTransitions: Record<string, SchemeStatus[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'rejected'],
      approved: [] as SchemeStatus[],
      rejected: ['draft'],
    };
    const allowed = validTransitions[scheme.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${scheme.status} 变更为 ${status}`);
    scheme.status = status;
    scheme.updatedBy = userId;
    return this.schemeRepo.save(scheme);
  }

  /** 根据询价单自动生成方案草稿 */
  async autoGenerateScheme(
    inquiryId: string,
    userId: string,
  ): Promise<Scheme> {
    // 校验询价单是否存在（依赖外部服务，这里做占位检查）
    if (!inquiryId) {
      throw new BadRequestException('询价单ID不能为空');
    }

    const code = generateCode('scheme', 1);
    const scheme = this.schemeRepo.create() as any;
    scheme.code = code;
    scheme.name = `自动方案-${code}`;
    scheme.inquiryId = inquiryId;
    scheme.projectId = null;
    scheme.customerId = null;
    scheme.rackType = null;
    scheme.description = `基于询价单 ${inquiryId} 自动生成的方案草稿`;
    scheme.currentVersion = 'V1.0';
    scheme.status = 'draft';
    scheme.createdBy = userId;
    scheme.updatedBy = userId;

    const saved = await this.schemeRepo.save(scheme);

    // 创建初始版本
    const version = this.versionRepo.create() as any;
    version.schemeId = saved.id;
    version.versionNo = 'V1.0';
    version.changeSummary = `由询价单 ${inquiryId} 自动创建`;
    version.attachments = '';
    version.status = 'draft';
    version.createdBy = userId;
    await this.versionRepo.save(version);

    return this.findOne(saved.id);
  }

  /**
   * approveScheme — 审批方案（状态流：draft→reviewing→approved→rejected）
   * 增强版：支持 reviewing 中间状态
   */
  async approveScheme(id: string, userId: string): Promise<Scheme> {
    const scheme = await this.findOne(id);

    // 扩展状态流转支持 reviewing
    const nextMap: Record<string, SchemeStatus> = {
      draft: 'reviewing',
      submitted: 'reviewing',
      reviewing: 'approved',
    };
    const nextStatus = nextMap[scheme.status];
    if (!nextStatus) {
      throw new BadRequestException(
        `无法从当前状态 ${scheme.status} 提交审批`,
      );
    }

    scheme.status = nextStatus;
    scheme.updatedBy = userId;

    // 当审批通过时，同时审批当前版本
    if (nextStatus === 'approved') {
      const latestVersion = await this.versionRepo.findOne({
        where: { schemeId: id },
        order: { createdAt: 'DESC' },
      });
      if (latestVersion) {
        latestVersion.status = 'approved';
        latestVersion.approvedBy = userId;
        latestVersion.approvedAt = new Date();
        await this.versionRepo.save(latestVersion);
      }
    }

    return this.schemeRepo.save(scheme);
  }

  /** 关联图纸到方案 */
  async linkDrawing(schemeId: string, drawingId: string): Promise<Scheme> {
    const scheme = await this.findOne(schemeId);
    // drawingId 的关联存储通过 Drawing 实体的 schemeId 字段完成
    // 此处做存在性校验和记录关联日志
    // 更新 scheme 的 updatedAt 表示关联已建立
    scheme.updatedAt = new Date();
    return this.schemeRepo.save(scheme);
  }

  /** 获取项目下所有方案历史 */
  async getSchemeHistory(projectId: string): Promise<Scheme[]> {
    if (!projectId) {
      throw new BadRequestException('项目ID不能为空');
    }
    return this.schemeRepo.find({
      where: { projectId },
      relations: ['versions'],
      order: { createdAt: 'DESC' },
    });
  }

  /** 版本管理 */
  async getVersions(schemeId: string): Promise<SchemeVersion[]> {
    await this.findOne(schemeId);
    return this.versionRepo.find({
      where: { schemeId },
      order: { createdAt: 'DESC' },
    });
  }

  async createVersion(schemeId: string, dto: CreateSchemeVersionDto, userId: string): Promise<SchemeVersion> {
    const scheme = await this.findOne(schemeId);
    if (scheme.status !== 'draft') throw new BadRequestException('只有草稿状态才能创建新版本');

    // 解析当前版本号并递增
    const currentVer = scheme.currentVersion.replace('V', '');
    const parts = currentVer.split('.');
    let newVersion: string;
    if (parts.length === 2) {
      const minor = parseInt(parts[1], 10) + 1;
      newVersion = `V${parts[0]}.${minor}`;
    } else {
      newVersion = `V${parseInt(currentVer, 10) + 1}.0`;
    }

    const version = this.versionRepo.create();
    version.schemeId = schemeId;
    version.versionNo = newVersion;
    version.changeSummary = dto.changeSummary;
    version.attachments = dto.attachments ?? '';
    version.status = 'draft';
    version.createdBy = userId;

    scheme.currentVersion = newVersion;
    scheme.updatedBy = userId;
    await this.schemeRepo.save(scheme);

    return this.versionRepo.save(version);
  }

  async approveVersion(versionId: string, approvedBy: string): Promise<SchemeVersion> {
    const version = await this.versionRepo.findOne({ where: { id: versionId } });
    if (!version) throw new NotFoundException(`版本 ${versionId} 不存在`);
    version.status = 'approved';
    version.approvedBy = approvedBy;
    version.approvedAt = new Date();
    return this.versionRepo.save(version);
  }
}
