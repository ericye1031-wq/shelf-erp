import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QualityCheckService } from './quality-check.service';
import { QualityCheck } from './quality-check.entity';
import { Defect } from './defect.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('M10-质量检查')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/quality-checks')
export class QualityCheckController {
  constructor(private readonly service: QualityCheckService) {}

  @Get()
  findAll(
    @Query() dto: PaginationDto,
    @Query('workOrderId') workOrderId?: string,
  ) {
    return this.service.findAll({ ...dto, workOrderId });
  }

  @Post()
  create(@Body() data: Partial<QualityCheck> & { defects?: Partial<Defect>[] }) {
    return this.service.create(data);
  }
}
