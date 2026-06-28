import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Drawing, DrawingStatus, DrawingCategory } from './drawing.entity';
import { CreateDrawingDto, UpdateDrawingDto, SearchDrawingDto } from './dto/drawing.dto';
import { PaginationDto, createPaginatedResponse, PaginatedData } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class DrawingService {
  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepo: Repository<Drawing>,
  ) {}

  async findAll(dto: PaginationDto): Promise<PaginatedData<Drawing>> {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.drawingRepo.createQueryBuilder('d');
    if (keyword) {
      qb.andWhere('(d.code LIKE :kw OR d.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('d.status = :status', { status });
    if (sortBy) qb.orderBy(`d.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('d.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize) as PaginatedData<Drawing>;
  }

  async findByCategory(category: DrawingCategory): Promise<Drawing[]> {
    return this.drawingRepo.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({ where: { id } });
    if (!drawing) throw new NotFoundException(`图纸 ${id} 不存在`);
    return drawing;
  }

  async create(dto: CreateDrawingDto, userId: string): Promise<Drawing> {
    const code = generateCode('drawing', 1);
    const drawing = this.drawingRepo.create();
    drawing.code = code;
    drawing.name = dto.name;
    drawing.projectId = dto.projectId ?? null;
    drawing.schemeId = dto.schemeId ?? null;
    drawing.category = dto.category as DrawingCategory;
    drawing.fileUrl = dto.fileUrl;
    drawing.fileSize = dto.fileSize ?? null;
    drawing.fileType = dto.fileType ?? null;
    drawing.status = 'designing';
    drawing.version = 'V1.0';
    drawing.uploadedBy = userId;
    drawing.uploadedAt = new Date();
    drawing.parentDrawingId = null;
    drawing.remark = dto.remark ?? null;
    drawing.createdBy = userId;
    drawing.updatedBy = userId;
    return this.drawingRepo.save(drawing);
  }

  async update(id: string, dto: UpdateDrawingDto, userId: string): Promise<Drawing> {
    const drawing = await this.findOne(id);
    if (drawing.status !== 'designing') throw new BadRequestException('只有设计中状态才能编辑');
    if (dto.name !== undefined) drawing.name = dto.name;
    if (dto.projectId !== undefined) drawing.projectId = dto.projectId;
    if (dto.schemeId !== undefined) drawing.schemeId = dto.schemeId;
    if (dto.category !== undefined) drawing.category = dto.category as DrawingCategory;
    if (dto.fileUrl !== undefined) drawing.fileUrl = dto.fileUrl;
    if (dto.fileSize !== undefined) drawing.fileSize = dto.fileSize;
    if (dto.fileType !== undefined) drawing.fileType = dto.fileType;
    if (dto.remark !== undefined) drawing.remark = dto.remark;
    drawing.updatedBy = userId;
    return this.drawingRepo.save(drawing);
  }

  async remove(id: string): Promise<void> {
    const drawing = await this.findOne(id);
    if (drawing.status !== 'designing') throw new BadRequestException('只有设计中状态才能删除');
    await this.drawingRepo.remove(drawing);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: DrawingStatus, userId: string): Promise<Drawing> {
    const drawing = await this.findOne(id);
    const validTransitions: Record<string, DrawingStatus[]> = {
      designing: ['reviewing'],
      reviewing: ['published', 'designing'],
      published: ['obsolete'],
      obsolete: [],
    };
    const allowed = validTransitions[drawing.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${drawing.status} 变更为 ${status}`);
    drawing.status = status;
    drawing.updatedBy = userId;
    return this.drawingRepo.save(drawing);
  }

  /** 图纸版本化：基于现有图纸创建新版本 */
  async versionDrawing(id: string, userId: string): Promise<Drawing> {
    const drawing = await this.findOne(id);

    // 递增版本号
    const currentVer = drawing.version.replace('V', '');
    const parts = currentVer.split('.');
    let newVersion: string;
    if (parts.length === 2) {
      const minor = parseInt(parts[1], 10) + 1;
      newVersion = `V${parts[0]}.${minor}`;
    } else {
      newVersion = `V${parseInt(currentVer, 10) + 1}.0`;
    }

    const code = generateCode('drawing', 1);
    const newDrawing = this.drawingRepo.create();
    newDrawing.code = code;
    newDrawing.name = drawing.name;
    newDrawing.projectId = drawing.projectId;
    newDrawing.schemeId = drawing.schemeId;
    newDrawing.category = drawing.category;
    newDrawing.fileUrl = drawing.fileUrl;
    newDrawing.fileSize = drawing.fileSize;
    newDrawing.fileType = drawing.fileType;
    newDrawing.status = 'designing';
    newDrawing.version = newVersion;
    newDrawing.uploadedBy = userId;
    newDrawing.uploadedAt = new Date();
    newDrawing.parentDrawingId = drawing.id;
    newDrawing.remark = drawing.remark;
    newDrawing.createdBy = userId;
    newDrawing.updatedBy = userId;

    return this.drawingRepo.save(newDrawing);
  }

  /** 获取图纸版本历史 */
  async getDrawingVersions(drawingId: string): Promise<Drawing[]> {
    const drawing = await this.findOne(drawingId);

    // 找到根节点（最原始版本）
    const rootId = drawing.parentDrawingId ?? drawing.id;

    // 获取所有关联版本
    const qb = this.drawingRepo.createQueryBuilder('d')
      .where('d.id = :rootId', { rootId })
      .orWhere('d.parentDrawingId = :rootId', { rootId })
      .orderBy('d.version', 'ASC');

    return qb.getMany();
  }

  /** 全文检索图纸 */
  async searchDrawings(keyword?: string, category?: string): Promise<Drawing[]> {
    const qb = this.drawingRepo.createQueryBuilder('d');

    if (keyword) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('d.code LIKE :kw', { kw: `%${keyword}%` })
            .orWhere('d.name LIKE :kw', { kw: `%${keyword}%` })
            .orWhere('d.remark LIKE :kw', { kw: `%${keyword}%` });
        }),
      );
    }

    if (category) {
      qb.andWhere('d.category = :category', { category });
    }

    qb.orderBy('d.updatedAt', 'DESC');
    return qb.getMany();
  }
}
