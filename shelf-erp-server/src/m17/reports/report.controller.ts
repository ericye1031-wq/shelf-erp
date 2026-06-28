import { Controller, Get, Post, Body, Put, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { CreateReportDto, UpdateReportDto, QueryReportDto } from './dto/report.dto';

@ApiTags('M17-BI-报表')
@Controller('m17/reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取报表列表' })
  @ApiResponse({ status: 200, description: '成功获取报表列表' })
  async findAll(@Query() query: QueryReportDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取报表详情' })
  @ApiResponse({ status: 200, description: '成功获取报表详情' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建报表' })
  @ApiResponse({ status: 201, description: '成功创建报表' })
  async create(@Body() dto: CreateReportDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新报表' })
  @ApiResponse({ status: 200, description: '成功更新报表' })
  async update(@Param('id') id: number, @Body() dto: UpdateReportDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除报表' })
  @ApiResponse({ status: 204, description: '成功删除报表' })
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
