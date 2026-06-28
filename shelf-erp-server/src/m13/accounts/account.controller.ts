import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('M13 - 科目管理')
@Controller('m13/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: '分页查询科目列表' })
  findAll(@Query() dto: PaginationDto & { parentId?: string }) {
    return this.accountService.findAll(dto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取科目树' })
  findTree() {
    return this.accountService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取科目详情' })
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: '获取子科目' })
  findChildren(@Param('id') id: string) {
    return this.accountService.findChildren(id);
  }

  @Post()
  @ApiOperation({ summary: '新增科目' })
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑科目' })
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(id, dto, 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除科目' })
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
