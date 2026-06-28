import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DrawingService } from './drawing.service';
import { CreateDrawingDto, UpdateDrawingDto, SearchDrawingDto } from './dto/drawing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DrawingStatus, DrawingCategory } from './drawing.entity';

@ApiTags('M03-图文档管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m03/drawings')
export class DrawingController {
  constructor(private readonly drawingService: DrawingService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.drawingService.findAll(dto);
  }

  @Get('search')
  searchDrawings(@Query() dto: SearchDrawingDto) {
    return this.drawingService.searchDrawings(dto.keyword, dto.category);
  }

  @Get('by-category/:category')
  findByCategory(@Param('category') category: DrawingCategory) {
    return this.drawingService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drawingService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDrawingDto, @CurrentUser('id') userId: string) {
    return this.drawingService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDrawingDto, @CurrentUser('id') userId: string) {
    return this.drawingService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drawingService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: DrawingStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.drawingService.changeStatus(id, status, userId);
  }

  /** 版本化图纸 */
  @Post(':id/version')
  versionDrawing(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.drawingService.versionDrawing(id, userId);
  }

  /** 获取图纸版本历史 */
  @Get(':id/versions')
  getDrawingVersions(@Param('id') id: string) {
    return this.drawingService.getDrawingVersions(id);
  }
}
