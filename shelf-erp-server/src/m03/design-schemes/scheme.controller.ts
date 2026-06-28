import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchemeService } from './scheme.service';
import { CreateSchemeDto, UpdateSchemeDto, CreateSchemeVersionDto } from './dto/scheme.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchemeStatus } from './scheme.entity';

@ApiTags('M03-方案管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m03/schemes')
export class SchemeController {
  constructor(private readonly schemeService: SchemeService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.schemeService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemeService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSchemeDto, @CurrentUser('id') userId: string) {
    return this.schemeService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchemeDto, @CurrentUser('id') userId: string) {
    return this.schemeService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemeService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: SchemeStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.schemeService.changeStatus(id, status, userId);
  }

  /** 从询价单自动生成方案 */
  @Post('auto-generate')
  autoGenerateScheme(
    @Body('inquiryId') inquiryId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.schemeService.autoGenerateScheme(inquiryId, userId);
  }

  /** 审批方案 */
  @Put(':id/approve')
  approveScheme(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.schemeService.approveScheme(id, userId);
  }

  /** 关联图纸到方案 */
  @Put(':id/link-drawing')
  linkDrawing(
    @Param('id') schemeId: string,
    @Body('drawingId') drawingId: string,
  ) {
    return this.schemeService.linkDrawing(schemeId, drawingId);
  }

  /** 获取项目下所有方案 */
  @Get('by-project/:projectId')
  getSchemeHistory(@Param('projectId') projectId: string) {
    return this.schemeService.getSchemeHistory(projectId);
  }

  /** 版本管理 */
  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.schemeService.getVersions(id);
  }

  @Post(':id/versions')
  createVersion(
    @Param('id') id: string,
    @Body() dto: CreateSchemeVersionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.schemeService.createVersion(id, dto, userId);
  }

  @Put('versions/:versionId/approve')
  approveVersion(
    @Param('versionId') versionId: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.schemeService.approveVersion(versionId, approvedBy);
  }
}
