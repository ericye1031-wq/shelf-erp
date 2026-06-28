import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScanRecordService } from './scan-record.service';
import { ScanRecord } from './scan-record.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('M10-扫码记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/scan-records')
export class ScanRecordController {
  constructor(private readonly service: ScanRecordService) {}

  @Get()
  findAll(
    @Query() dto: PaginationDto,
    @Query('workOrderId') workOrderId?: string,
    @Query('type') type?: string,
  ) {
    return this.service.findAll({ ...dto, workOrderId, type });
  }

  @Post()
  create(@Body() data: Partial<ScanRecord>) {
    return this.service.create(data);
  }
}
