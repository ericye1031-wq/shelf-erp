import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiScheduleService } from './ai-schedule.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('M19-AI智能排产')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m19/ai-schedule')
export class AiScheduleController {
  constructor(private readonly aiScheduleService: AiScheduleService) {}

  @Post('optimize')
  optimize(@Body() body: { batchId: string; constraints?: Record<string, any> }) {
    return this.aiScheduleService.optimize(body.batchId, body.constraints);
  }

  @Get(':batchId')
  getResult(@Param('batchId') batchId: string) {
    return this.aiScheduleService.getResult(batchId);
  }

  @Get()
  getHistory(@Query() dto: PaginationDto) {
    return this.aiScheduleService.getHistory(dto);
  }
}
