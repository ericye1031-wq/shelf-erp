import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseRequisitionService } from './purchase-requisition.service';
import { CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionDto } from './dto/purchase-requisition.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequisitionStatus } from './purchase-requisition.entity';

@ApiTags('M09-采购申请')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m09/requisitions')
export class PurchaseRequisitionController {
  constructor(private readonly requisitionService: PurchaseRequisitionService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.requisitionService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseRequisitionDto, @CurrentUser('id') userId: string) {
    return this.requisitionService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseRequisitionDto, @CurrentUser('id') userId: string) {
    return this.requisitionService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitionService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: RequisitionStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.requisitionService.changeStatus(id, status, userId);
  }
}
