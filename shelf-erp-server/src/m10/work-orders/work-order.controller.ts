import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, ProcessStepDto } from './dto/work-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkOrderStatus } from './work-order.entity';
import { MaterialDemandService } from '../material-demands/material-demand.service';

@ApiTags('M10-生产管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/work-orders')
export class WorkOrderController {
  constructor(
    private readonly woService: WorkOrderService,
    private readonly mdService: MaterialDemandService,
  ) {}

  @Get()
  @Permissions('m10:read')
  findAll(@Query() dto: PaginationDto) {
    return this.woService.findAll(dto);
  }

  @Get(':id')
  @Permissions('m10:read')
  findOne(@Param('id') id: string) {
    return this.woService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWorkOrderDto, @CurrentUser('id') userId: string) {
    return this.woService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto, @CurrentUser('id') userId: string) {
    return this.woService.update(id, dto, userId);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.woService.changeStatus(id, status, userId);
  }

  /** 下达工单 */
  @Post(':id/release')
  release(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.woService.changeStatus(id, 'released' as WorkOrderStatus, userId);
  }

  /** 工序 */
  @Get(':woId/process-steps')
  getProcessSteps(@Param('woId') woId: string) {
    return this.woService.getProcessSteps(woId);
  }

  @Put(':woId/process-steps')
  setProcessSteps(@Param('woId') woId: string, @Body() steps: ProcessStepDto[]) {
    return this.woService.setProcessSteps(woId, steps);
  }

  @Put(':woId/process-steps/:stepId/status')
  updateStepStatus(@Param('stepId') stepId: string, @Body('status') status: string) {
    return this.woService.updateStepStatus(stepId, status);
  }

  /** 物料需求 */
  @Get(':woId/material-demands')
  getMaterialDemands(@Param('woId') woId: string) {
    return this.mdService.findByWorkOrder(woId);
  }
}
