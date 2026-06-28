import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiCostPrediction } from './ai-cost-prediction.entity';
import { AiCostPredictionService } from './ai-cost-prediction.service';
import { AiCostPredictionController } from './ai-cost-prediction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiCostPrediction])],
  controllers: [AiCostPredictionController],
  providers: [AiCostPredictionService],
  exports: [AiCostPredictionService],
})
export class M20Module {}
