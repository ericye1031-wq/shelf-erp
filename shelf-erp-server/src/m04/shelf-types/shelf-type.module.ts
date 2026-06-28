import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShelfType } from './shelf-type.entity';
import { Specification } from '../specifications/specification.entity';
import { ShelfTypeService } from './shelf-type.service';
import { ShelfTypeController } from './shelf-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShelfType, Specification])],
  controllers: [ShelfTypeController],
  providers: [ShelfTypeService],
  exports: [ShelfTypeService],
})
export class ShelfTypeModule {}
