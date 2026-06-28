import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OeeService } from './oee.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('M10-OEE分析')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/oee')
export class OeeController {
  constructor(private readonly service: OeeService) {}

  @Get()
  findAll(
    @Query() dto: PaginationDto,
    @Query('equipmentId') equipmentId?: string,
    @Query('date') date?: string,
  ) {
    return this.service.findAll({ ...dto, equipmentId, date });
  }

  @Post()
  create(@Body() body: {
    equipmentId: string;
    equipmentName: string;
    date: string;
    plannedTime: number;
    runTime: number;
    idealCycle: number;
    actualCycle: number;
    totalOutput: number;
    goodOutput: number;
  }) {
    return this.service.createWithCalc(body);
  }

  @Get('trend')
  getTrend(
    @Query('equipmentId') equipmentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getTrend(equipmentId, startDate, endDate);
  }

  @Get('summary')
  getSummary(
    @Query('equipmentId') equipmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSummary(equipmentId, startDate, endDate);
  }
}
