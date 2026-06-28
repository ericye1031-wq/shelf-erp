import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 发票管理')
@Controller('m13/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: '分页查询发票列表' })
  findAll(
    @Query()
    dto: PaginationDto & {
      invoiceType?: string;
      verificationStatus?: string;
      relatedId?: string;
    },
  ) {
    return this.invoiceService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取发票详情' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增发票' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑发票' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, dto, 'system');
  }

  @Post(':id/verify')
  @ApiOperation({ summary: '发票验证/认证' })
  verify(@Param('id') id: string) {
    return this.invoiceService.verify(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除发票' })
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }
}
