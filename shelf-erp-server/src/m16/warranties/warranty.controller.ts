import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyDto, UpdateWarrantyDto, QueryWarrantyDto } from './dto/warranty.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 质保管理')
@Controller('m16/warranties')
export class WarrantyController {
  constructor(private readonly service: WarrantyService) {}

  @Get()
  @ApiOperation({ summary: '分页查询质保记录列表' })
  findAll(@Query() dto: QueryWarrantyDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取质保记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增质保记录' })
  create(@Body() dto: CreateWarrantyDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑质保记录' })
  update(@Param('id') id: string, @Body() dto: UpdateWarrantyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除质保记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
