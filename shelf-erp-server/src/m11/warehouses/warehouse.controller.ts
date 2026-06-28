import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { WmsAdvancedService } from './wms-advanced.service';
import { CreateWarehouseDto, UpdateWarehouseDto, InventoryInboundDto, InventoryOutboundDto } from './dto/warehouse.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M11-仓储管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m11')
export class WarehouseController {
  constructor(
    private readonly whService: WarehouseService,
    private readonly advanced: WmsAdvancedService,
  ) {}

  // ---- 仓库 ----
  @Get('warehouses')
  findAllWarehouses(@Query() dto: PaginationDto) {
    return this.whService.findAllWarehouses(dto);
  }

  @Get('warehouses/:id')
  findOneWarehouse(@Param('id') id: string) {
    return this.whService.findOneWarehouse(id);
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto, @CurrentUser('id') userId: string) {
    return this.whService.createWarehouse(dto, userId);
  }

  @Put('warehouses/:id')
  updateWarehouse(@Param('id') id: string, @Body() dto: UpdateWarehouseDto, @CurrentUser('id') userId: string) {
    return this.whService.updateWarehouse(id, dto, userId);
  }

  // ---- 库存 ----
  @Get('inventory')
  findAllInventory(@Query() dto: PaginationDto & { warehouseId?: string }) {
    return this.whService.findAllInventory(dto);
  }

  @Post('inventory/inbound')
  inbound(@Body() dto: InventoryInboundDto, @CurrentUser('id') userId: string) {
    return this.whService.inbound(dto, userId);
  }

  @Post('inventory/outbound')
  outbound(@Body() dto: InventoryOutboundDto, @CurrentUser('id') userId: string) {
    return this.whService.outbound(dto, userId);
  }

  /** 低库存预警 */
  @Get('inventory/low-stock')
  getLowStockAlerts(@Query('warehouseId') warehouseId?: string) {
    return this.whService.getLowStockAlerts(warehouseId);
  }

  // ===== WMS深度功能 (SRS §11.2) =====

  // ---- 库位管理 ----
  @Get('locations')
  findAllLocations(@Query('warehouseId') warehouseId?: string) {
    return this.advanced.findAllLocations(warehouseId);
  }

  @Post('locations')
  createLocation(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.advanced.createLocation(body, userId);
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id') id: string) {
    return this.advanced.deleteLocation(id);
  }

  // ---- FIFO出库 ----
  @Post('inventory/outbound-fifo')
  outboundFifo(@Body() body: {
    warehouseId: string;
    partCode: string;
    quantity: number;
    referenceNo?: string;
    remark?: string;
  }, @CurrentUser('id') userId: string) {
    return this.advanced.outboundFifo(body.warehouseId, body.partCode, body.quantity, userId, body.referenceNo, body.remark);
  }

  // ---- 批次管理 ----
  @Get('inventory/batches')
  findBatches(@Query('partCode') partCode: string, @Query('warehouseId') warehouseId?: string) {
    return this.advanced.findBatches(partCode, warehouseId);
  }

  // ---- 呆滞库存 ----
  @Get('inventory/slow-moving')
  findSlowMoving(@Query('days') days?: number, @Query('warehouseId') warehouseId?: string) {
    return this.advanced.findSlowMoving(days ?? 90, warehouseId);
  }

  // ---- 盘点管理 ----
  @Get('counts')
  findAllCounts(@Query('warehouseId') warehouseId?: string) {
    return this.advanced.findAllCounts(warehouseId);
  }

  @Post('counts')
  createCount(@Body() body: { warehouseId: string; type: string; countDate: string; inventoryIds: string[] }, @CurrentUser('id') userId: string) {
    return this.advanced.createCount(body, userId);
  }

  @Post('counts/:id/submit')
  submitCountItems(@Param('id') id: string, @Body() body: { items: Array<{ inventoryId: string; actualQty: number; locCode?: string; remark?: string }> }) {
    return this.advanced.submitCountItems(id, body.items);
  }

  @Post('counts/:id/reconcile')
  reconcileCount(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.advanced.reconcileCount(id, userId);
  }
}
