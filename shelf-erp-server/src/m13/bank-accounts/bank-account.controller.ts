import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateBankTransactionDto,
} from './dto/bank-account.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 银行账户')
@Controller('m13/bank-accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Get()
  @ApiOperation({ summary: '分页查询银行账户列表' })
  findAll(@Query() dto: PaginationDto) {
    return this.bankAccountService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取银行账户详情' })
  findOne(@Param('id') id: string) {
    return this.bankAccountService.findOne(id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: '获取银行账户流水' })
  getTransactions(
    @Param('id') id: string,
    @Query() dto: PaginationDto & { startDate?: string; endDate?: string; direction?: string },
  ) {
    return this.bankAccountService.getTransactions(id, dto);
  }

  @Post()
  @ApiOperation({ summary: '新增银行账户' })
  create(@Body() dto: CreateBankAccountDto) {
    return this.bankAccountService.create(dto, 'system');
  }

  @Post('transactions')
  @ApiOperation({ summary: '录入银行流水' })
  addTransaction(@Body() dto: CreateBankTransactionDto) {
    return this.bankAccountService.addTransaction(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑银行账户' })
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    return this.bankAccountService.update(id, dto, 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除银行账户' })
  remove(@Param('id') id: string) {
    return this.bankAccountService.remove(id);
  }
}
