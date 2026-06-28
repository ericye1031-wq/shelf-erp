import { Module } from '@nestjs/common';
import { CustomerModule } from './customers/customer.module';
import { OpportunityModule } from './opportunities/opportunity.module';
import { InquiryModule } from './inquiries/inquiry.module';
import { FollowUpModule } from './followups/follow-up.module';

@Module({
  imports: [CustomerModule, OpportunityModule, InquiryModule, FollowUpModule],
  exports: [CustomerModule, OpportunityModule, InquiryModule, FollowUpModule],
})
export class M02Module {}
