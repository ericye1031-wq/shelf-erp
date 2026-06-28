import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseItemDto } from './dto/purchase.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseStatus } from './purchase-order.entity';

@ApiTags('M08-采购管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m08/purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.purchaseService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: PurchaseStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseService.changeStatus(id, status, userId);
  }

  /** 采购明细 */
  @Get(':orderId/items')
  getItems(@Param('orderId') orderId: string) {
    return this.purchaseService.getItems(orderId);
  }

  @Put(':orderId/items')
  setItems(@Param('orderId') orderId: string, @Body() items: PurchaseItemDto[]) {
    return this.purchaseService.setItems(orderId, items);
  }
}
