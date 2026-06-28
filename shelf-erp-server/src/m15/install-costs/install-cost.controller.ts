import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallCostService } from './install-cost.service';
import { CreateInstallCostDto, UpdateInstallCostDto } from './dto/install-cost.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M15-安装成本')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/costs')
export class InstallCostController {
  constructor(private readonly installCostService: InstallCostService) {}

  @Get()
  findByPlanId(@Query('planId') planId: string) {
    return this.installCostService.findByPlanId(planId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installCostService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallCostDto, @CurrentUser('id') userId: string) {
    return this.installCostService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstallCostDto, @CurrentUser('id') userId: string) {
    return this.installCostService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installCostService.remove(id);
  }
}
