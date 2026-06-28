import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiScheduleResult } from './ai-schedule.entity';
import { AiScheduleService } from './ai-schedule.service';
import { AiScheduleController } from './ai-schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiScheduleResult])],
  controllers: [AiScheduleController],
  providers: [AiScheduleService],
  exports: [AiScheduleService],
})
export class M19Module {}
