import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SparePartUsage } from './spare-part-usage.entity';
import { SparePartUsageService } from './spare-part-usage.service';
import { SparePartUsageController } from './spare-part-usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SparePartUsage])],
  providers: [SparePartUsageService],
  controllers: [SparePartUsageController],
  exports: [SparePartUsageService],
})
export class SparePartUsageModule {}
