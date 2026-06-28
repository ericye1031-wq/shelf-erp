import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { SupplierRatingService } from './supplier-rating.service';
import { SupplierQuoteService } from './supplier-quote.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupplierStatus } from './supplier.entity';

@ApiTags('M09-供应商管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m09/suppliers')
export class SupplierController {
  constructor(
    private readonly supplierService: SupplierService,
    private readonly ratingService: SupplierRatingService,
    private readonly quoteService: SupplierQuoteService,
  ) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.supplierService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto, @CurrentUser('id') userId: string) {
    return this.supplierService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @CurrentUser('id') userId: string) {
    return this.supplierService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: SupplierStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.supplierService.changeStatus(id, status, userId);
  }

  // ===== 供应商评级 (SRS §8.1) =====

  @Post(':id/rate')
  rateSupplier(
    @Param('id') id: string,
    @Body() scores: { deliveryRate: number; qualityRate: number; priceScore: number; serviceScore: number },
    @Body('period') period: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingService.rateSupplier(id, scores, userId, period ?? new Date().toISOString().slice(0, 7));
  }

  @Get(':id/ratings')
  getRatingHistory(@Param('id') id: string) {
    return this.ratingService.getRatingHistory(id);
  }

  // ===== 价格库管理 =====

  @Get(':id/prices')
  findAllPrices(@Param('id') id: string) {
    return this.quoteService.findAllPrices(id);
  }

  @Post(':id/prices')
  addPrice(@Param('id') id: string, @Body() body: any, @CurrentUser('id') userId: string) {
    return this.quoteService.addPrice({ ...body, supplierId: id, createdBy: userId });
  }
}

@ApiTags('M09-询比价')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m09/quotes')
export class SupplierQuoteController {
  constructor(private readonly quoteService: SupplierQuoteService) {}

  @Post()
  submitQuote(@Body() body: any) {
    return this.quoteService.submitQuote(body);
  }

  @Get('compare/:requisitionId')
  compareQuotes(@Param('requisitionId') requisitionId: string) {
    return this.quoteService.compareQuotes(requisitionId);
  }

  @Get('material/:materialCode')
  getByMaterial(@Param('materialCode') materialCode: string) {
    return this.quoteService.getPricesByMaterial(materialCode);
  }
}
