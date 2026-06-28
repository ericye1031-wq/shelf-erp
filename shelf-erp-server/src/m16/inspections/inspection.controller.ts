import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto, UpdateInspectionDto, QueryInspectionDto } from './dto/inspection.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 巡检管理')
@Controller('m16/inspections')
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  @Get()
  @ApiOperation({ summary: '分页查询巡检记录列表' })
  findAll(@Query() dto: QueryInspectionDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取巡检记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增巡检记录' })
  create(@Body() dto: CreateInspectionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑巡检记录' })
  update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除巡检记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
