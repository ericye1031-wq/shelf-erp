import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BomService } from './bom.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BOM, BomStatus } from './bom.entity';
import { BomItem } from './bom-item.entity';
import { BomVersion } from './bom-version.entity';
import { AlternativeMaterial } from './alternative-material.entity';

@ApiTags('M08-BOM管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m08')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  // ---- BOM CRUD ----

  @Get('boms')
  findAllBoms(@Query() dto: PaginationDto) {
    return this.bomService.findAll(dto);
  }

  @Get('boms/:id')
  findOneBom(@Param('id') id: string) {
    return this.bomService.findOne(id);
  }

  @Post('boms')
  createBom(@Body() data: Partial<BOM>, @CurrentUser('id') userId: string) {
    return this.bomService.create(data, userId);
  }

  @Put('boms/:id')
  updateBom(@Param('id') id: string, @Body() data: Partial<BOM>, @CurrentUser('id') userId: string) {
    return this.bomService.update(id, data, userId);
  }

  @Delete('boms/:id')
  removeBom(@Param('id') id: string) {
    return this.bomService.remove(id);
  }

  // ---- BOM 明细 ----

  @Get('boms/:bomId/items')
  getBomItems(@Param('bomId') bomId: string) {
    return this.bomService.getItems(bomId);
  }

  @Put('boms/:bomId/items')
  setBomItems(@Param('bomId') bomId: string, @Body() items: Partial<BomItem>[]) {
    return this.bomService.setItems(bomId, items);
  }

  // ---- BOM 版本 ----

  @Get('boms/:bomId/versions')
  getBomVersions(@Param('bomId') bomId: string) {
    return this.bomService.getVersions(bomId);
  }

  @Post('boms/:bomId/versions')
  createBomVersion(@Param('bomId') bomId: string, @Body() data: Partial<BomVersion>, @CurrentUser('id') userId: string) {
    return this.bomService.createVersion(bomId, data, userId);
  }

  // ---- 替代料 ----

  @Get('bom-items/:bomItemId/alternatives')
  getAlternatives(@Param('bomItemId') bomItemId: string) {
    return this.bomService.getAlternatives(bomItemId);
  }

  @Post('bom-items/:bomItemId/alternatives')
  createAlternative(@Param('bomItemId') bomItemId: string, @Body() data: Partial<AlternativeMaterial>) {
    return this.bomService.createAlternative(bomItemId, data);
  }

  @Put('bom-items/:bomItemId/alternatives/:id')
  updateAlternative(
    @Param('bomItemId') bomItemId: string,
    @Param('id') id: string,
    @Body() data: Partial<AlternativeMaterial>,
  ) {
    return this.bomService.updateAlternative(bomItemId, id, data);
  }

  @Delete('bom-items/:bomItemId/alternatives/:id')
  deleteAlternative(@Param('bomItemId') bomItemId: string, @Param('id') id: string) {
    return this.bomService.deleteAlternative(bomItemId, id);
  }

  // ===== BOM高级管理 =====

  @Post(':id/convert-to-mbom')
  convertToMBOM(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bomService.convertToMBOM(id, userId);
  }

  @Post(':id/convert-to-cbom')
  convertToCBOM(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bomService.convertToCBOM(id, userId);
  }

  @Get(':id/compare-versions')
  compareVersions(@Param('id') id: string, @Query('v1') v1: string, @Query('v2') v2: string) {
    return this.bomService.compareVersions(id, parseInt(v1), parseInt(v2));
  }

  @Get(':id/expand')
  expandBOM(@Param('id') id: string) {
    return this.bomService.expandBOM(id);
  }

  @Get('where-used/:partCode')
  findWhereUsed(@Param('partCode') partCode: string) {
    return this.bomService.findWhereUsed(partCode);
  }
}
