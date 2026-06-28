import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallPlanService } from './install-plan.service';
import { CreateInstallPlanDto, UpdateInstallPlanDto } from './dto/install-plan.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InstallPlanStatus } from './install-plan.entity';

@ApiTags('M15-安装计划')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/plans')
export class InstallPlanController {
  constructor(private readonly installPlanService: InstallPlanService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.installPlanService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installPlanService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallPlanDto, @CurrentUser('id') userId: string) {
    return this.installPlanService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstallPlanDto, @CurrentUser('id') userId: string) {
    return this.installPlanService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installPlanService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: InstallPlanStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.installPlanService.changeStatus(id, status, userId);
  }
}
