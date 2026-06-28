import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseReimbursement } from './expense-reimbursement.entity';
import { ExpenseReimbursementService } from './expense-reimbursement.service';
import { ExpenseReimbursementController } from './expense-reimbursement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseReimbursement])],
  controllers: [ExpenseReimbursementController],
  providers: [ExpenseReimbursementService],
  exports: [ExpenseReimbursementService],
})
export class ExpenseReimbursementModule {}
