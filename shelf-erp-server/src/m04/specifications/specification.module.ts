import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specification } from './specification.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { SpecificationService } from './specification.service';
import { SpecificationController } from './specification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Specification, ShelfType])],
  controllers: [SpecificationController],
  providers: [SpecificationService],
  exports: [SpecificationService],
})
export class SpecificationModule {}
