import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialDemand } from './material-demand.entity';
import { MaterialDemandService } from './material-demand.service';
import { MaterialDemandController } from './material-demand.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialDemand])],
  controllers: [MaterialDemandController],
  providers: [MaterialDemandService],
  exports: [MaterialDemandService],
})
export class MaterialDemandModule {}
