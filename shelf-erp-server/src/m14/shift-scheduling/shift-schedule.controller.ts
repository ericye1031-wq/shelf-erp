import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftScheduleService } from './shift-schedule.service';
import { CreateShiftScheduleDto, UpdateShiftScheduleDto } from './dto/shift-schedule.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M14-排班管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m14/shift-schedules')
export class ShiftScheduleController {
  constructor(private readonly shiftScheduleService: ShiftScheduleService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.shiftScheduleService.findAll(dto);
  }

  @Get('generate')
  generateWeeklySchedule(
    @Query('departmentId') departmentId: string,
    @Query('weekStart') weekStart: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shiftScheduleService.generateWeeklySchedule(departmentId, weekStart, userId);
  }

  @Get('by-date-range')
  getScheduleByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.shiftScheduleService.getScheduleByDateRange(startDate, endDate, departmentId);
  }

  @Get('employee/:id')
  getEmployeeSchedule(@Param('id') id: string, @Query('month') month: string) {
    return this.shiftScheduleService.getEmployeeSchedule(id, month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftScheduleService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShiftScheduleDto, @CurrentUser('id') userId: string) {
    return this.shiftScheduleService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShiftScheduleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shiftScheduleService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftScheduleService.remove(id);
  }
}
