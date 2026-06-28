import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReturnVisitService } from './return-visit.service';
import { CreateReturnVisitDto, UpdateReturnVisitDto, QueryReturnVisitDto } from './dto/return-visit.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 客户回访')
@Controller('m16/return-visits')
export class ReturnVisitController {
  constructor(private readonly service: ReturnVisitService) {}

  @Get()
  @ApiOperation({ summary: '分页查询回访记录列表' })
  findAll(@Query() dto: QueryReturnVisitDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取回访记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增回访记录' })
  create(@Body() dto: CreateReturnVisitDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑回访记录' })
  update(@Param('id') id: string, @Body() dto: UpdateReturnVisitDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除回访记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
