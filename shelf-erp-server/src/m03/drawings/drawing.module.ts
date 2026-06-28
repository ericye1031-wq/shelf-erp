import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drawing } from './drawing.entity';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Drawing])],
  controllers: [DrawingController],
  providers: [DrawingService],
  exports: [DrawingService],
})
export class DrawingModule {}
