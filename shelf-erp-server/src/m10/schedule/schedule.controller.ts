import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { ScheduleItem } from './schedule.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('M10-排程管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Get()
  findAll(
    @Query() dto: PaginationDto,
    @Query('workOrderId') workOrderId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.service.findAll({ ...dto, workOrderId, equipmentId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<ScheduleItem>) {
    return this.service.update(id, data);
  }
}
