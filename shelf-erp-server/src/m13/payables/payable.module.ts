import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsPayable } from './payable.entity';
import { PaymentRequest } from './payment-request.entity';
import { Payment } from './payment.entity';
import { PayableService } from './payable.service';
import { PayableController } from './payable.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountsPayable, PaymentRequest, Payment])],
  controllers: [PayableController],
  providers: [PayableService],
  exports: [PayableService],
})
export class PayableModule {}
