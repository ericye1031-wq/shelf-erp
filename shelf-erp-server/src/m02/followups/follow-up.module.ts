import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUp } from './follow-up.entity';
import { Customer } from '../customers/customer.entity';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUp, Customer])],
  controllers: [FollowUpController],
  providers: [FollowUpService],
  exports: [FollowUpService],
})
export class FollowUpModule {}
