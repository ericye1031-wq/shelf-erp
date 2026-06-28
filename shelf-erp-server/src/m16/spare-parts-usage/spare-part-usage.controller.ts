import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SparePartUsageService } from './spare-part-usage.service';
import { CreateSparePartUsageDto, UpdateSparePartUsageDto, QuerySparePartUsageDto } from './dto/spare-part-usage.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 备件使用')
@Controller('m16/spare-parts-usage')
export class SparePartUsageController {
  constructor(private readonly service: SparePartUsageService) {}

  @Get()
  @ApiOperation({ summary: '分页查询备件使用记录' })
  findAll(@Query() dto: QuerySparePartUsageDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get('by-repair/:repairId')
  @ApiOperation({ summary: '按维修记录查询备件使用' })
  getByRepair(@Param('repairId') repairId: string) {
    return this.service.getByRepair(repairId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取备件使用记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增备件使用记录' })
  create(@Body() dto: CreateSparePartUsageDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑备件使用记录' })
  update(@Param('id') id: string, @Body() dto: UpdateSparePartUsageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除备件使用记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
