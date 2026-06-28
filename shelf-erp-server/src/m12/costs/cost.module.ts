import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostDimension } from './cost-dimension.entity';
import { CostAlert } from './cost-alert.entity';
import { CostService } from './cost.service';
import { CostController } from './cost.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CostDimension, CostAlert])],
  controllers: [CostController],
  providers: [CostService],
  exports: [CostService],
})
export class CostModule {}
