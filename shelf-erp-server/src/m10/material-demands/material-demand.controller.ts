import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialDemandService } from './material-demand.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('M10-物料需求')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/material-demands')
export class MaterialDemandController {
  constructor(private readonly service: MaterialDemandService) {}

  @Get()
  findAll(@Query('workOrderId') workOrderId?: string) {
    if (workOrderId) {
      return this.service.findByWorkOrder(workOrderId);
    }
    return this.service.findAll();
  }

  @Get('shortages')
  findShortages() {
    return this.service.findShortages();
  }

  @Post('calculate/:workOrderId')
  calculateDemands(@Param('workOrderId') workOrderId: string) {
    return this.service.calculateMRP(workOrderId);
  }

  @Post()
  create(@Body() body: {
    workOrderId: string;
    bomItemId?: string;
    material: string;
    spec?: string;
    requiredQty: number;
    availableQty: number;
    unit: string;
    plannedDate?: string;
  }) {
    return this.service.create(body);
  }
}
