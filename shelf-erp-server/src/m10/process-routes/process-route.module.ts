import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessRoute } from './process-route.entity';
import { ProcessRouteStep } from './process-route-step.entity';
import { ProcessRouteService } from './process-route.service';
import { ProcessRouteController } from './process-route.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessRoute, ProcessRouteStep])],
  controllers: [ProcessRouteController],
  providers: [ProcessRouteService],
  exports: [ProcessRouteService],
})
export class ProcessRouteModule {}
