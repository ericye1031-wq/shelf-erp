import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShelfTypeService } from './shelf-type.service';
import { CreateShelfTypeDto, UpdateShelfTypeDto } from './dto/shelf-type.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M04-货架类型')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m04/shelf-types')
export class ShelfTypeController {
  constructor(private readonly stService: ShelfTypeService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.stService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stService.findOne(id);
  }

  @Get(':id/specifications')
  findSpecs(@Param('id') id: string) {
    return this.stService.findSpecifications(id);
  }

  @Post()
  create(@Body() dto: CreateShelfTypeDto, @CurrentUser('id') userId: string) {
    return this.stService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShelfTypeDto, @CurrentUser('id') userId: string) {
    return this.stService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stService.remove(id);
  }
}
