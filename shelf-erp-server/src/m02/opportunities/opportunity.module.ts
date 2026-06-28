import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from './opportunity.entity';
import { Customer } from '../customers/customer.entity';
import { OpportunityService } from './opportunity.service';
import { OpportunityController } from './opportunity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity, Customer])],
  controllers: [OpportunityController],
  providers: [OpportunityService],
  exports: [OpportunityService],
})
export class OpportunityModule {}
