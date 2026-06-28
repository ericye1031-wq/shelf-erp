import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShelfConfigService } from './shelf-config.service';
import { CreateShelfConfigDto, UpdateShelfConfigDto } from './dto/shelf-config.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BomCalculatorService } from '../bom-calculator/bom-calculator.service';

@ApiTags('M04-货架配置')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m04/configs')
export class ShelfConfigController {
  constructor(
    private readonly configService: ShelfConfigService,
    private readonly bomCalculator: BomCalculatorService,
  ) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.configService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShelfConfigDto, @CurrentUser('id') userId: string) {
    return this.configService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShelfConfigDto, @CurrentUser('id') userId: string) {
    return this.configService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }

  @Post(':configId/calculate-bom')
  calculateBom(@Param('configId') configId: string) {
    return this.bomCalculator.calculateBom(configId);
  }

  @Post(':configId/match-spec')
  matchSpec(@Param('configId') configId: string) {
    return this.configService.matchSpec(configId);
  }
}
