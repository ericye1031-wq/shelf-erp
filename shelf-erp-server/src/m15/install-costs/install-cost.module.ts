import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallCost } from './install-cost.entity';
import { InstallCostService } from './install-cost.service';
import { InstallCostController } from './install-cost.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallCost])],
  controllers: [InstallCostController],
  providers: [InstallCostService],
  exports: [InstallCostService],
})
export class InstallCostModule {}
