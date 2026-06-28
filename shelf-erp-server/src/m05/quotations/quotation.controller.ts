import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto, UpdateQuotationDto, CreateCostItemDto, VersionCompareDto } from './dto/quotation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M05-报价管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m05/quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get()
  @Permissions('m05:read')
  findAll(@Query() dto: PaginationDto) {
    return this.quotationService.findAll(dto);
  }

  @Get(':id')
  @Permissions('m05:read')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Post()
  @Permissions('m05:create')
  create(@Body() dto: CreateQuotationDto, @CurrentUser('id') userId: string) {
    return this.quotationService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto, @CurrentUser('id') userId: string) {
    return this.quotationService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationService.remove(id);
  }

  /** 提交报价 */
  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.quotationService.submit(id, userId);
  }

  /** 审批通过 */
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.quotationService.approve(id, userId);
  }

  /** 发送报价 */
  @Post(':id/send')
  send(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.quotationService.send(id, userId);
  }

  /** 接受/拒绝 */
  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body('accept') accept: boolean,
    @CurrentUser('id') userId: string,
  ) {
    return this.quotationService.respond(id, accept, userId);
  }

  /** 版本列表 */
  @Get(':quotationId/versions')
  getVersions(@Param('quotationId') quotationId: string) {
    return this.quotationService.getVersions(quotationId);
  }

  /** 版本对比 */
  @Get(':quotationId/compare')
  compareVersions(@Param('quotationId') quotationId: string, @Query() dto: VersionCompareDto) {
    return this.quotationService.compareVersions(quotationId, dto);
  }

  /** 成本项列表 */
  @Get(':quotationId/cost-items')
  getCostItems(@Param('quotationId') quotationId: string) {
    return this.quotationService.getCostItems(quotationId);
  }

  /** 添加成本项 */
  @Post(':quotationId/cost-items')
  addCostItem(@Param('quotationId') quotationId: string, @Body() dto: CreateCostItemDto) {
    return this.quotationService.addCostItem(quotationId, dto);
  }

  /** 批量设置成本项 */
  @Put(':quotationId/cost-items')
  setCostItems(@Param('quotationId') quotationId: string, @Body() items: CreateCostItemDto[]) {
    return this.quotationService.setCostItems(quotationId, items);
  }

  /** 删除成本项 */
  @Delete(':quotationId/cost-items/:costItemId')
  removeCostItem(
    @Param('quotationId') quotationId: string,
    @Param('costItemId') costItemId: string,
  ) {
    return this.quotationService.removeCostItem(quotationId, costItemId);
  }
}
