import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayableService } from './payable.service';
import {
  CreatePayableDto,
  CreatePaymentRequestDto,
  CreatePaymentDto,
} from './dto/payable.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 应付管理')
@Controller('m13/payables')
export class PayableController {
  constructor(private readonly payableService: PayableService) {}

  @Get()
  @ApiOperation({ summary: '分页查询应付列表' })
  findAll(@Query() dto: PaginationDto & { supplierId?: string }) {
    return this.payableService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '应付统计' })
  getStats() {
    return this.payableService.getStats();
  }

  @Get('requests')
  @ApiOperation({ summary: '付款申请列表' })
  findRequests(@Query() dto: PaginationDto & { payableId?: string }) {
    return this.payableService.findRequests(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应付详情' })
  findOne(@Param('id') id: string) {
    return this.payableService.findOne(id);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: '获取应付的付款记录' })
  getPayments(@Param('id') id: string) {
    return this.payableService.getPayments(id);
  }

  @Post()
  @ApiOperation({ summary: '建应付记录' })
  create(@Body() dto: CreatePayableDto) {
    return this.payableService.create(dto, 'system');
  }

  @Post('requests')
  @ApiOperation({ summary: '创建付款申请' })
  createPaymentRequest(@Body() dto: CreatePaymentRequestDto) {
    return this.payableService.createPaymentRequest(dto, 'system');
  }

  @Patch('requests/:requestId/submit')
  @ApiOperation({ summary: '提交付款申请' })
  submitRequest(@Param('requestId') requestId: string) {
    return this.payableService.submitRequest(requestId, 'system');
  }

  @Patch('requests/:requestId/approve')
  @ApiOperation({ summary: '批准付款申请' })
  approveRequest(@Param('requestId') requestId: string) {
    return this.payableService.approveRequest(requestId, 'system');
  }

  @Patch('requests/:requestId/reject')
  @ApiOperation({ summary: '驳回付款申请' })
  rejectRequest(@Param('requestId') requestId: string) {
    return this.payableService.rejectRequest(requestId, 'system');
  }

  @Post('payments')
  @ApiOperation({ summary: '新增付款记录' })
  addPayment(@Body() dto: CreatePaymentDto) {
    return this.payableService.addPayment(dto, 'system');
  }

  @Patch('payments/:paymentId/cancel')
  @ApiOperation({ summary: '取消付款' })
  cancelPayment(@Param('paymentId') paymentId: string) {
    return this.payableService.cancelPayment(paymentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应付记录' })
  remove(@Param('id') id: string) {
    return this.payableService.remove(id);
  }
}
