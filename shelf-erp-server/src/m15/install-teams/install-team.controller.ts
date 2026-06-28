import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallTeamService } from './install-team.service';
import { CreateInstallTeamDto } from './dto/install-team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M15-人员安排')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/teams')
export class InstallTeamController {
  constructor(private readonly installTeamService: InstallTeamService) {}

  @Get()
  findByPlanId(@Query('planId') planId: string) {
    return this.installTeamService.findByPlanId(planId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installTeamService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallTeamDto, @CurrentUser('id') userId: string) {
    return this.installTeamService.create(dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installTeamService.remove(id);
  }
}
