import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiQuotation } from './ai-quotation.entity';
import { Inquiry } from '../m02/inquiries/inquiry.entity';
import { AiQuotationService } from './ai-quotation.service';
import { AiQuotationController } from './ai-quotation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiQuotation, Inquiry])],
  controllers: [AiQuotationController],
  providers: [AiQuotationService],
  exports: [AiQuotationService],
})
export class M18Module {}
