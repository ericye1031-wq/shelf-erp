import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallPlan } from './install-plan.entity';
import { InstallPlanService } from './install-plan.service';
import { InstallPlanController } from './install-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallPlan])],
  controllers: [InstallPlanController],
  providers: [InstallPlanService],
  exports: [InstallPlanService],
})
export class InstallPlanModule {}
