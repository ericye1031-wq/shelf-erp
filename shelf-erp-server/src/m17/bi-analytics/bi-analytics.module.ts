import { Module } from '@nestjs/common';
import { BiAnalyticsService } from './bi-analytics.service';
import { BiAnalyticsController } from './bi-analytics.controller';

@Module({
  providers: [BiAnalyticsService],
  controllers: [BiAnalyticsController],
  exports: [BiAnalyticsService],
})
export class BiAnalyticsModule {}
