import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repair } from './repair.entity';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Repair])],
  providers: [RepairService],
  controllers: [RepairController],
})
export class RepairModule {}
