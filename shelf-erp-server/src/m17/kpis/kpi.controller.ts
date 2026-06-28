import { Controller, Get, Post, Body, Put, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KpiService } from './kpi.service';
import { KPI } from './kpi.entity';
import { CreateKpiDto, UpdateKpiDto, QueryKpiDto } from './dto/kpi.dto';

@ApiTags('M17-BI-KPI指标')
@Controller('m17/kpis')
export class KpiController {
  constructor(private readonly service: KpiService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取KPI指标列表' })
  @ApiResponse({ status: 200, description: '成功获取KPI指标列表' })
  async findAll(@Query() query: QueryKpiDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取KPI指标详情' })
  @ApiResponse({ status: 200, description: '成功获取KPI指标详情' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建KPI指标' })
  @ApiResponse({ status: 201, description: '成功创建KPI指标' })
  async create(@Body() dto: CreateKpiDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新KPI指标' })
  @ApiResponse({ status: 200, description: '成功更新KPI指标' })
  async update(@Param('id') id: number, @Body() dto: UpdateKpiDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除KPI指标' })
  @ApiResponse({ status: 204, description: '成功删除KPI指标' })
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
