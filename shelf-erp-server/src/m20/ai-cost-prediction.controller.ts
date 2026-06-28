import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiCostPredictionService } from './ai-cost-prediction.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('M20-AI成本预测')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m20/ai-cost-prediction')
export class AiCostPredictionController {
  constructor(private readonly aiCostPredictionService: AiCostPredictionService) {}

  @Post('predict')
  predict(@Body() body: { materialCode: string; months?: number }) {
    return this.aiCostPredictionService.predictMaterialCost(
      body.materialCode,
      body.months ?? 6,
    );
  }

  @Get('trend')
  getTrend() {
    return this.aiCostPredictionService.getTrend();
  }

  @Get('project/:projectId')
  predictProjectCost(@Param('projectId') projectId: string) {
    return this.aiCostPredictionService.predictProjectCost(projectId);
  }
}
