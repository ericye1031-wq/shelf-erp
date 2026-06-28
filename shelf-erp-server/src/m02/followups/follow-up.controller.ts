import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto } from './dto/follow-up.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M02-跟进记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m02/followups')
export class FollowUpController {
  constructor(private readonly fuService: FollowUpService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.fuService.findAll(dto);
  }

  @Post()
  create(@Body() dto: CreateFollowUpDto, @CurrentUser('id') userId: string) {
    return this.fuService.create(dto, userId);
  }
}
