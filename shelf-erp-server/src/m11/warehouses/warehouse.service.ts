import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Inventory, InventoryTransaction } from './inventory.entity';
import { CreateWarehouseDto, UpdateWarehouseDto, InventoryInboundDto, InventoryOutboundDto } from './dto/warehouse.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly whRepo: Repository<Warehouse>,
    @InjectRepository(Inventory)
    private readonly invRepo: Repository<Inventory>,
    @InjectRepository(InventoryTransaction)
    private readonly txRepo: Repository<InventoryTransaction>,
  ) {}

  // ---- 仓库 ----
  async findAllWarehouses(dto: PaginationDto) {
    const { page = 1, pageSize = 20 } = dto;
    const [items, total] = await this.whRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { code: 'ASC' },
    });
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOneWarehouse(id: string): Promise<Warehouse> {
    const wh = await this.whRepo.findOne({ where: { id } });
    if (!wh) throw new NotFoundException(`仓库 ${id} 不存在`);
    return wh;
  }

  async createWarehouse(dto: CreateWarehouseDto, userId: string): Promise<Warehouse> {
    const wh = this.whRepo.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.whRepo.save(wh);
  }

  async updateWarehouse(id: string, dto: UpdateWarehouseDto, userId: string): Promise<Warehouse> {
    const wh = await this.findOneWarehouse(id);
    Object.assign(wh, dto, { updatedBy: userId });
    return this.whRepo.save(wh);
  }

  // ---- 库存 ----
  async findAllInventory(dto: PaginationDto & { warehouseId?: string }) {
    const { page = 1, pageSize = 20, keyword, warehouseId } = dto;
    const qb = this.invRepo.createQueryBuilder('i');
    if (keyword) qb.andWhere('(i.partCode LIKE :kw OR i.partName LIKE :kw)', { kw: `%${keyword}%` });
    if (warehouseId) qb.andWhere('i.warehouseId = :warehouseId', { warehouseId });
    qb.orderBy('i.updatedAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async inbound(dto: InventoryInboundDto, userId: string): Promise<Inventory> {
    // 查找或创建库存记录
    let inv = await this.invRepo.findOne({
      where: {
        warehouseId: dto.warehouseId,
        partCode: dto.partCode ?? '',
      },
    });

    if (inv) {
      const beforeQty = inv.quantity;
      inv.quantity = Number(inv.quantity) + dto.quantity;
      inv.updatedBy = userId;

      // 记录事务
      await this.txRepo.save(this.txRepo.create({
        inventoryId: inv.id,
        warehouseId: dto.warehouseId,
        type: 'in',
        quantity: dto.quantity,
        beforeQty,
        afterQty: inv.quantity,
        remark: dto.remark,
        createdBy: userId,
      }));

      return this.invRepo.save(inv);
    }

    // 新建库存
    inv = this.invRepo.create({
      warehouseId: dto.warehouseId,
      partCode: dto.partCode,
      partName: dto.partName,
      material: dto.material,
      spec: dto.spec,
      unit: dto.unit,
      quantity: dto.quantity,
      safetyStock: dto.safetyStock ?? 0,
      batchNo: dto.batchNo,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.invRepo.save(inv);

    await this.txRepo.save(this.txRepo.create({
      inventoryId: saved.id,
      warehouseId: dto.warehouseId,
      type: 'in',
      quantity: dto.quantity,
      beforeQty: 0,
      afterQty: dto.quantity,
      remark: dto.remark,
      createdBy: userId,
    }));

    return saved;
  }

  async outbound(dto: InventoryOutboundDto, userId: string): Promise<Inventory> {
    const inv = await this.invRepo.findOne({ where: { id: dto.inventoryId } });
    if (!inv) throw new NotFoundException(`库存 ${dto.inventoryId} 不存在`);

    const beforeQty = Number(inv.quantity);
    if (beforeQty < dto.quantity) throw new BadRequestException('库存不足');

    inv.quantity = beforeQty - dto.quantity;
    inv.updatedBy = userId;

    await this.txRepo.save(this.txRepo.create({
      inventoryId: inv.id,
      warehouseId: inv.warehouseId,
      type: 'out',
      quantity: dto.quantity,
      beforeQty,
      afterQty: inv.quantity,
      remark: dto.remark,
      createdBy: userId,
    }));

    return this.invRepo.save(inv);
  }

  /** 低库存预警 */
  async getLowStockAlerts(warehouseId?: string): Promise<Inventory[]> {
    const qb = this.invRepo.createQueryBuilder('i')
      .where('i.quantity <= i.safetyStock');
    if (warehouseId) qb.andWhere('i.warehouseId = :warehouseId', { warehouseId });
    return qb.getMany();
  }
}
