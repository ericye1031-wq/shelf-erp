import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto, UpdateOpportunityDto, UpdateStageDto } from './dto/opportunity.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M02-商机管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m02/opportunities')
export class OpportunityController {
  constructor(private readonly oppService: OpportunityService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.oppService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oppService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOpportunityDto, @CurrentUser('id') userId: string) {
    return this.oppService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto, @CurrentUser('id') userId: string) {
    return this.oppService.update(id, dto, userId);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateStageDto, @CurrentUser('id') userId: string) {
    return this.oppService.updateStage(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oppService.remove(id);
  }
}
