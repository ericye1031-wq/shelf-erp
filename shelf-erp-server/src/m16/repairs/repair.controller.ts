import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RepairService } from './repair.service';
import { CreateRepairDto, UpdateRepairDto, QueryRepairDto } from './dto/repair.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 维修管理')
@Controller('m16/repairs')
export class RepairController {
  constructor(private readonly service: RepairService) {}

  @Get('history/:projectId')
  @ApiOperation({ summary: '获取项目维修历史' })
  getRepairHistory(@Param('projectId') projectId: string) {
    return this.service.getRepairHistory(projectId);
  }

  @Get(':id/cost')
  @ApiOperation({ summary: '计算维修成本' })
  calculateRepairCost(@Param('id') id: string) {
    return this.service.calculateRepairCost(id);
  }

  @Get()
  @ApiOperation({ summary: '分页查询维修记录列表' })
  findAll(@Query() dto: QueryRepairDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取维修记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增维修记录' })
  create(@Body() dto: CreateRepairDto) {
    return this.service.create(dto);
  }

  @Post(':id/spare-parts')
  @ApiOperation({ summary: '关联备件到维修记录' })
  linkSpareParts(@Param('id') id: string, @Body() spareParts: any[]) {
    return this.service.linkSpareParts(id, spareParts);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑维修记录' })
  update(@Param('id') id: string, @Body() dto: UpdateRepairDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除维修记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
