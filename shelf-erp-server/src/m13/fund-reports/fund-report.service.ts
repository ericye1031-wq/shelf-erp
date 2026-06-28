import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankAccount } from '../bank-accounts/bank-account.entity';
import { BankTransaction } from '../bank-accounts/bank-transaction.entity';
import dayjs from 'dayjs';

@Injectable()
export class FundReportService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly accountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private readonly txRepo: Repository<BankTransaction>,
  ) {}

  async getDailyReport(date: string) {
    const reportDate = dayjs(date).format('YYYY-MM-DD');
    const startOfDay = `${reportDate}T00:00:00`;
    const endOfDay = `${reportDate}T23:59:59`;

    // 获取所有活跃账户
    const accounts = await this.accountRepo.find({
      where: { active: true },
      order: { accountType: 'ASC', name: 'ASC' },
    });

    // 获取当天的流水
    const transactions = await this.txRepo.find({
      where: {
        transactionDate: Between(new Date(startOfDay), new Date(endOfDay)),
      },
    });

    // 计算每个账户的余额和当日流水
    const accountDetails = accounts.map((acc) => {
      const accTxs = transactions.filter((tx) => tx.bankAccountId === acc.id);
      const totalIn = accTxs
        .filter((tx) => tx.direction === 'in')
        .reduce((s, tx) => s + Number(tx.amount), 0);
      const totalOut = accTxs
        .filter((tx) => tx.direction === 'out')
        .reduce((s, tx) => s + Number(tx.amount), 0);
      return {
        id: acc.id,
        name: acc.name,
        accountNo: acc.accountNo,
        bankName: acc.bankName,
        balance: Number(acc.balance),
        totalIn,
        totalOut,
        txCount: accTxs.length,
      };
    });

    const totalBalance = accountDetails.reduce((s, a) => s + a.balance, 0);
    const totalIn = accountDetails.reduce((s, a) => s + a.totalIn, 0);
    const totalOut = accountDetails.reduce((s, a) => s + a.totalOut, 0);
    const netFlow = totalIn - totalOut;

    return {
      date: reportDate,
      accounts: accountDetails,
      summary: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalIn: Math.round(totalIn * 100) / 100,
        totalOut: Math.round(totalOut * 100) / 100,
        netFlow: Math.round(netFlow * 100) / 100,
      },
    };
  }
}
