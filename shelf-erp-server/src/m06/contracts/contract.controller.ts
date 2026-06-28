import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { CreateContractDto, UpdateContractDto, CreatePaymentPlanDto, CreateInvoiceDto } from './dto/contract.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ContractStatus } from './contract.entity';

@ApiTags('M06-合同管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m06/contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @Permissions('m06:read')
  findAll(@Query() dto: PaginationDto) {
    return this.contractService.findAll(dto);
  }

  @Get(':id')
  @Permissions('m06:read')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser('id') userId: string) {
    return this.contractService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser('id') userId: string) {
    return this.contractService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: ContractStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.contractService.changeStatus(id, status, userId);
  }

  // ---- 回款计划 ----
  @Get(':contractId/payment-plans')
  getPaymentPlans(@Param('contractId') contractId: string) {
    return this.contractService.getPaymentPlans(contractId);
  }

  @Post(':contractId/payment-plans')
  addPaymentPlan(
    @Param('contractId') contractId: string,
    @Body() dto: CreatePaymentPlanDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.contractService.addPaymentPlan(contractId, dto, userId);
  }

  @Put(':contractId/payment-plans/:planId/status')
  updatePaymentPlanStatus(
    @Param('planId') planId: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.contractService.updatePaymentPlanStatus(planId, status, userId);
  }

  // ---- 发票 ----
  @Get(':contractId/invoices')
  getInvoices(@Param('contractId') contractId: string) {
    return this.contractService.getInvoices(contractId);
  }

  @Post(':contractId/invoices')
  addInvoice(
    @Param('contractId') contractId: string,
    @Body() dto: CreateInvoiceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.contractService.addInvoice(contractId, dto, userId);
  }
}
