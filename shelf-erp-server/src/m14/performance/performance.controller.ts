import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto, UpdatePerformanceDto } from './dto/performance.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PerformanceStatus } from './performance-review.entity';

@ApiTags('M14-绩效评估')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m14/performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.performanceService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performanceService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePerformanceDto, @CurrentUser('id') userId: string) {
    return this.performanceService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePerformanceDto, @CurrentUser('id') userId: string) {
    return this.performanceService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.performanceService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: PerformanceStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.performanceService.changeStatus(id, status, userId);
  }
}
