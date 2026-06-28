import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReceivingInspectionService } from './receiving-inspection.service';
import { CreateReceivingInspectionDto, UpdateReceivingInspectionDto } from './dto/receiving-inspection.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M09-来料检验')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m09/inspections')
export class ReceivingInspectionController {
  constructor(private readonly inspectionService: ReceivingInspectionService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.inspectionService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateReceivingInspectionDto, @CurrentUser('id') userId: string) {
    return this.inspectionService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReceivingInspectionDto, @CurrentUser('id') userId: string) {
    return this.inspectionService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inspectionService.remove(id);
  }
}
