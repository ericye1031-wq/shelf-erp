import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsReceivable } from './receivable.entity';
import { Receipt } from './receipt.entity';
import { ReceivableService } from './receivable.service';
import { ReceivableController } from './receivable.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountsReceivable, Receipt])],
  controllers: [ReceivableController],
  providers: [ReceivableService],
  exports: [ReceivableService],
})
export class ReceivableModule {}
