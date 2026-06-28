import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FundReportService } from './fund-report.service';
import { FundDailyReportQueryDto } from './dto/fund-report.dto';

@ApiTags('M13 - 资金报表')
@Controller('m13/fund-reports')
export class FundReportController {
  constructor(private readonly fundReportService: FundReportService) {}

  @Get('daily')
  @ApiOperation({ summary: '资金日报' })
  getDailyReport(@Query() dto: FundDailyReportQueryDto) {
    return this.fundReportService.getDailyReport(dto.date);
  }
}
