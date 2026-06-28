import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallReportService } from './install-report.service';
import { CreateInstallReportDto, PDAReportDto, DailyReportQueryDto } from './dto/install-report.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M15-安装报工')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/reports')
export class InstallReportController {
  constructor(private readonly installReportService: InstallReportService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.installReportService.findAll(dto);
  }

  @Get('daily')
  getDailyReport(@Query() dto: DailyReportQueryDto) {
    return this.installReportService.getDailyReport(dto.date, dto.teamId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installReportService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallReportDto, @CurrentUser('id') userId: string) {
    return this.installReportService.create(dto, userId);
  }

  /** PDA移动端报工 */
  @Post('pda')
  submitPDAReport(@Body() dto: PDAReportDto, @CurrentUser('id') userId: string) {
    return this.installReportService.submitPDAReport(dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installReportService.remove(id);
  }

  /** 计算安装计划成本 */
  @Get('cost/:planId')
  calculateInstallCost(@Param('planId') planId: string) {
    return this.installReportService.calculateInstallCost(planId);
  }
}
