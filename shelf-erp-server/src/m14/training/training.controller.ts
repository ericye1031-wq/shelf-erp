import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { CreateTrainingDto, UpdateTrainingDto } from './dto/training.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TrainingStatus } from './training-record.entity';

@ApiTags('M14-培训管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m14/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.trainingService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTrainingDto, @CurrentUser('id') userId: string) {
    return this.trainingService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainingDto, @CurrentUser('id') userId: string) {
    return this.trainingService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingService.remove(id);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: TrainingStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.trainingService.changeStatus(id, status, userId);
  }
}
