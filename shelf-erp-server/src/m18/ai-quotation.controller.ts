import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiQuotationService } from './ai-quotation.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('M18-AI自动报价')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m18/ai-quotation')
export class AiQuotationController {
  constructor(private readonly aiQuotationService: AiQuotationService) {}

  @Post('predict')
  predict(@Body('inquiryId') inquiryId: string) {
    return this.aiQuotationService.predictPrice(inquiryId);
  }

  @Get()
  getHistory(@Query() dto: PaginationDto) {
    return this.aiQuotationService.getHistory(dto);
  }

  @Get('accuracy')
  getAccuracy() {
    return this.aiQuotationService.getAccuracy();
  }
}
