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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExpenseReimbursementService } from './expense-reimbursement.service';
import {
  CreateExpenseReimbursementDto,
  UpdateExpenseReimbursementDto,
} from './dto/expense-reimbursement.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 费用报销')
@Controller('m13/expense-reimbursements')
export class ExpenseReimbursementController {
  constructor(
    private readonly expenseService: ExpenseReimbursementService,
  ) {}

  @Get()
  @ApiOperation({ summary: '分页查询报销单列表' })
  findAll(
    @Query() dto: PaginationDto & { expenseType?: string; applicantId?: string },
  ) {
    return this.expenseService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报销单详情' })
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增报销单(草稿)' })
  create(@Body() dto: CreateExpenseReimbursementDto) {
    return this.expenseService.create(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑报销单(仅草稿)' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseReimbursementDto) {
    return this.expenseService.update(id, dto, 'system');
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交报销单' })
  submit(@Param('id') id: string) {
    return this.expenseService.submit(id, 'system');
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批通过' })
  @ApiQuery({ name: 'approverId', required: true, description: '审批人ID' })
  approve(
    @Param('id') id: string,
    @Query('approverId') approverId: string,
  ) {
    return this.expenseService.approve(id, 'system', approverId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '驳回报销单' })
  @ApiQuery({ name: 'reason', required: false, description: '驳回原因' })
  reject(
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.expenseService.reject(id, 'system', reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除报销单(仅草稿)' })
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
