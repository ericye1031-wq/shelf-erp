import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallIssueService } from './install-issue.service';
import { CreateInstallIssueDto, UpdateInstallIssueDto } from './dto/install-issue.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M15-现场问题')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/issues')
export class InstallIssueController {
  constructor(private readonly installIssueService: InstallIssueService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.installIssueService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installIssueService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallIssueDto, @CurrentUser('id') userId: string) {
    return this.installIssueService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstallIssueDto) {
    return this.installIssueService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installIssueService.remove(id);
  }
}
