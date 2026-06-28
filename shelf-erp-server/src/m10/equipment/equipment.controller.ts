import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { Equipment } from './equipment.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M10-设备管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/equipment')
export class EquipmentController {
  constructor(private readonly service: EquipmentService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Equipment>, @CurrentUser('id') userId: string) {
    return this.service.update(id, data, userId);
  }
}
