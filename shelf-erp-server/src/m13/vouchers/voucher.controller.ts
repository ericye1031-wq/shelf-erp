import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto, UpdateVoucherDto, AuditVoucherDto } from './dto/voucher.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 凭证管理')
@Controller('m13/vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @ApiOperation({ summary: '分页查询凭证列表' })
  findAll(@Query() dto: PaginationDto & { voucherDate?: string }) {
    return this.voucherService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取凭证详情(含分录)' })
  findOne(@Param('id') id: string) {
    return this.voucherService.findOne(id);
  }

  @Get(':id/entries')
  @ApiOperation({ summary: '获取凭证明细分录' })
  getEntries(@Param('id') id: string) {
    return this.voucherService.getEntries(id);
  }

  @Post()
  @ApiOperation({ summary: '录入凭证' })
  create(@Body() dto: CreateVoucherDto) {
    return this.voucherService.create(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑凭证' })
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.voucherService.update(id, dto, 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除凭证' })
  remove(@Param('id') id: string) {
    return this.voucherService.remove(id);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: '提交审核' })
  submit(@Param('id') id: string) {
    return this.voucherService.submit(id, 'system');
  }

  @Patch(':id/audit')
  @ApiOperation({ summary: '审核凭证' })
  audit(@Param('id') id: string, @Body() dto: AuditVoucherDto) {
    return this.voucherService.audit(id, 'system');
  }

  @Patch(':id/post')
  @ApiOperation({ summary: '过账' })
  post(@Param('id') id: string) {
    return this.voucherService.post(id, 'system');
  }

  @Patch(':id/reverse')
  @ApiOperation({ summary: '红字冲销' })
  reverse(@Param('id') id: string) {
    return this.voucherService.reverse(id, 'system');
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消凭证' })
  cancel(@Param('id') id: string) {
    return this.voucherService.cancel(id, 'system');
  }
}
