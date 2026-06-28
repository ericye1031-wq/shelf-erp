import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OeeData } from './oee.entity';
import { OeeService } from './oee.service';
import { OeeController } from './oee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OeeData])],
  controllers: [OeeController],
  providers: [OeeService],
  exports: [OeeService],
})
export class OeeModule {}
