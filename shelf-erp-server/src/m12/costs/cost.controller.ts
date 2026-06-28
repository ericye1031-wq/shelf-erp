import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CostService } from './cost.service';
import { CreateCostDimensionDto, UpdateCostDimensionDto } from './dto/cost.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M12-成本核算')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m12')
export class CostController {
  constructor(private readonly costService: CostService) {}

  // ---- 成本维度 ----
  @Get('dimensions')
  findAll(@Query() dto: PaginationDto & { projectId?: string; quotationId?: string }) {
    return this.costService.findAll(dto);
  }

  @Get('dimensions/:id')
  findOne(@Param('id') id: string) {
    return this.costService.findOne(id);
  }

  @Post('dimensions')
  create(@Body() dto: CreateCostDimensionDto, @CurrentUser('id') userId: string) {
    return this.costService.create(dto, userId);
  }

  @Put('dimensions/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCostDimensionDto, @CurrentUser('id') userId: string) {
    return this.costService.update(id, dto, userId);
  }

  /** 项目成本汇总 */
  @Get('projects/:projectId/summary')
  getProjectCostSummary(@Param('projectId') projectId: string) {
    return this.costService.getProjectCostSummary(projectId);
  }

  // ---- 成本预警 ----
  @Get('alerts')
  getAlerts(@Query('projectId') projectId?: string) {
    return this.costService.getAlerts(projectId);
  }

  @Put('alerts/:alertId/resolve')
  resolveAlert(@Param('alertId') alertId: string) {
    return this.costService.resolveAlert(alertId);
  }
}
