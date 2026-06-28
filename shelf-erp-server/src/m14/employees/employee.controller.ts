import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EmployeeStatus } from './employee.entity';

@ApiTags('M14-员工管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m14/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.employeeService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto, @CurrentUser('id') userId: string) {
    return this.employeeService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser('id') userId: string) {
    return this.employeeService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: EmployeeStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.employeeService.changeStatus(id, status, userId);
  }
}
