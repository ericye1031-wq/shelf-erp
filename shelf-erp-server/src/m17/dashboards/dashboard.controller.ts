import { Controller, Get, Post, Body, Put, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Dashboard } from './dashboard.entity';
import { CreateDashboardDto, UpdateDashboardDto, QueryDashboardDto } from './dto/dashboard.dto';

@ApiTags('M17-BI-仪表板')
@Controller('m17/dashboards')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取仪表板列表' })
  @ApiResponse({ status: 200, description: '成功获取仪表板列表' })
  async findAll(@Query() query: QueryDashboardDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取仪表板详情' })
  @ApiResponse({ status: 200, description: '成功获取仪表板详情' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建仪表板' })
  @ApiResponse({ status: 201, description: '成功创建仪表板' })
  async create(@Body() dto: CreateDashboardDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新仪表板' })
  @ApiResponse({ status: 200, description: '成功更新仪表板' })
  async update(@Param('id') id: number, @Body() dto: UpdateDashboardDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除仪表板' })
  @ApiResponse({ status: 204, description: '成功删除仪表板' })
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
