import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { PaymentPlan } from './payment-plan.entity';
import { Invoice } from './invoice.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, PaymentPlan, Invoice])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
