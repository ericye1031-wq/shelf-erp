import { Module } from '@nestjs/common';
import { ContractModule } from './contracts/contract.module';

@Module({
  imports: [ContractModule],
  exports: [ContractModule],
})
export class M06Module {}
