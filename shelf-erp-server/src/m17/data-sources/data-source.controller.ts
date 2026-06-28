import { Controller, Get, Post, Body, Put, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSourceService } from './data-source.service';
import { DataSource } from './data-source.entity';
import { CreateDataSourceDto, UpdateDataSourceDto, QueryDataSourceDto } from './dto/data-source.dto';

@ApiTags('M17-BI-数据源')
@Controller('m17/data-sources')
export class DataSourceController {
  constructor(private readonly service: DataSourceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取数据源列表' })
  @ApiResponse({ status: 200, description: '成功获取数据源列表' })
  async findAll(@Query() query: QueryDataSourceDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取数据源详情' })
  @ApiResponse({ status: 200, description: '成功获取数据源详情' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建数据源' })
  @ApiResponse({ status: 201, description: '成功创建数据源' })
  async create(@Body() dto: CreateDataSourceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新数据源' })
  @ApiResponse({ status: 200, description: '成功更新数据源' })
  async update(@Param('id') id: number, @Body() dto: UpdateDataSourceDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除数据源' })
  @ApiResponse({ status: 204, description: '成功删除数据源' })
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
