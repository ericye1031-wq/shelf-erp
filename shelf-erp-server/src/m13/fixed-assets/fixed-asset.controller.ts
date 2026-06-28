import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FixedAssetService } from './fixed-asset.service';
import { CreateFixedAssetDto, UpdateFixedAssetDto } from './dto/fixed-asset.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('M13 - 固定资产管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m13/fixed-assets')
export class FixedAssetController {
  constructor(private readonly fixedAssetService: FixedAssetService) {}

  @Get()
  @ApiOperation({ summary: '分页查询固定资产列表' })
  @Permissions('m13:read')
  findAll(@Query() dto: PaginationDto & { category?: string; status?: string }) {
    return this.fixedAssetService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取固定资产详情' })
  @Permissions('m13:read')
  findOne(@Param('id') id: string) {
    return this.fixedAssetService.findOne(id);
  }

  @Get(':id/depreciation-schedule')
  @ApiOperation({ summary: '获取折旧计划表' })
  getDepreciationSchedule(@Param('id') id: string) {
    return this.fixedAssetService.getSchedule(id);
  }

  @Post()
  @ApiOperation({ summary: '新增固定资产' })
  create(@Body() dto: CreateFixedAssetDto) {
    return this.fixedAssetService.create(dto, 'system');
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑固定资产' })
  update(@Param('id') id: string, @Body() dto: UpdateFixedAssetDto) {
    return this.fixedAssetService.update(id, dto, 'system');
  }

  @Post(':id/dispose')
  @ApiOperation({ summary: '处置固定资产' })
  dispose(@Param('id') id: string) {
    return this.fixedAssetService.dispose(id, 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除固定资产' })
  remove(@Param('id') id: string) {
    return this.fixedAssetService.remove(id);
  }
}
