import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceTicketService } from './service-ticket.service';
import { CreateServiceTicketDto, UpdateServiceTicketDto, QueryServiceTicketDto } from './dto/service-ticket.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M16 - 服务工单')
@Controller('m16/service-tickets')
export class ServiceTicketController {
  constructor(private readonly service: ServiceTicketService) {}

  @Get()
  @ApiOperation({ summary: '分页查询服务工单列表' })
  findAll(@Query() dto: QueryServiceTicketDto & PaginationDto) {
    return this.service.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '服务工单统计' })
  getServiceStats() {
    return this.service.getServiceStats();
  }

  @Get('auto-dispatch')
  @ApiOperation({ summary: '自动分配工单给合适的工程师' })
  autoDispatch(@Query('serviceType') serviceType: string, @Query('region') region: string) {
    return this.service.autoDispatch(serviceType, region);
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: '按项目查询服务工单' })
  getByProject(@Param('projectId') projectId: string) {
    return this.service.getByProject(projectId);
  }

  @Get('warranty-check/:projectId')
  @ApiOperation({ summary: '检查项目是否在质保期内' })
  checkWarrantyStatus(@Param('projectId') projectId: string) {
    return this.service.checkWarrantyStatus(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务工单详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增服务工单' })
  create(@Body() dto: CreateServiceTicketDto) {
    return this.service.create(dto);
  }

  @Post(':id/rating')
  @ApiOperation({ summary: '提交客户满意度评价' })
  submitCustomerRating(
    @Param('id') id: string,
    @Query('rating') rating: number,
    @Query('comment') comment: string,
  ) {
    return this.service.submitCustomerRating(id, rating, comment);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑服务工单' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceTicketDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除服务工单' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
