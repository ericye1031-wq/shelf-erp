import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnVisit } from './return-visit.entity';
import { ReturnVisitService } from './return-visit.service';
import { ReturnVisitController } from './return-visit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnVisit])],
  providers: [ReturnVisitService],
  controllers: [ReturnVisitController],
})
export class ReturnVisitModule {}
