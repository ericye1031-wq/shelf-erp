import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from './data-source.entity';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataSource])],
  providers: [DataSourceService],
  controllers: [DataSourceController],
  exports: [DataSourceService],
})
export class DataSourceModule {}
