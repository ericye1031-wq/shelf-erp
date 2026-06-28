import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReceivableService } from './receivable.service';
import { CreateReceivableDto, CreateReceiptDto } from './dto/receivable.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 应收管理')
@Controller('m13/receivables')
export class ReceivableController {
  constructor(private readonly receivableService: ReceivableService) {}

  @Get()
  @ApiOperation({ summary: '分页查询应收列表' })
  findAll(@Query() dto: PaginationDto & { customerId?: string }) {
    return this.receivableService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '应收统计' })
  getStats() {
    return this.receivableService.getStats();
  }

  @Get('aging')
  @ApiOperation({ summary: '账龄分析' })
  getAging() {
    return this.receivableService.getAging();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应收详情' })
  findOne(@Param('id') id: string) {
    return this.receivableService.findOne(id);
  }

  @Get(':id/receipts')
  @ApiOperation({ summary: '获取应收的收款记录' })
  getReceipts(@Param('id') id: string) {
    return this.receivableService.getReceipts(id);
  }

  @Post()
  @ApiOperation({ summary: '创建应收记录' })
  create(@Body() dto: CreateReceivableDto) {
    return this.receivableService.create(dto, 'system');
  }

  @Post('receipts')
  @ApiOperation({ summary: '新增收款' })
  addReceipt(@Body() dto: CreateReceiptDto) {
    return this.receivableService.addReceipt(dto, 'system');
  }

  @Patch('receipts/:receiptId/cancel')
  @ApiOperation({ summary: '取消收款' })
  cancelReceipt(@Param('receiptId') receiptId: string) {
    return this.receivableService.cancelReceipt(receiptId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应收记录' })
  remove(@Param('id') id: string) {
    return this.receivableService.remove(id);
  }
}
