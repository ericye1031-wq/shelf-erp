import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { CreateSalaryDto, UpdateSalaryDto } from './dto/salary.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SalaryStatus } from './salary-record.entity';

@ApiTags('M14-薪酬管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m14/salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.salaryService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSalaryDto, @CurrentUser('id') userId: string) {
    return this.salaryService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalaryDto, @CurrentUser('id') userId: string) {
    return this.salaryService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: SalaryStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.salaryService.changeStatus(id, status, userId);
  }
}
