import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SpecificationService } from './specification.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from './dto/specification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M04-规格管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m04/specifications')
export class SpecificationController {
  constructor(private readonly specService: SpecificationService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.specService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSpecificationDto, @CurrentUser('id') userId: string) {
    return this.specService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpecificationDto, @CurrentUser('id') userId: string) {
    return this.specService.update(id, dto, userId);
  }
}
