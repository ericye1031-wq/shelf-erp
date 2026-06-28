import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftSchedule } from './shift-schedule.entity';
import { ShiftScheduleService } from './shift-schedule.service';
import { ShiftScheduleController } from './shift-schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftSchedule])],
  controllers: [ShiftScheduleController],
  providers: [ShiftScheduleService],
  exports: [ShiftScheduleService],
})
export class ShiftScheduleModule {}
