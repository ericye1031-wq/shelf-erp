import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, CreateMilestoneDto, UpdateMilestoneDto } from './dto/project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProjectStatus } from './project.entity';

@ApiTags('M07-项目管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m07/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.projectService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  /** 状态流转 */
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.changeStatus(id, status, userId);
  }

  // ---- 里程碑 ----
  @Get(':projectId/milestones')
  getMilestones(@Param('projectId') projectId: string) {
    return this.projectService.getMilestones(projectId);
  }

  @Post(':projectId/milestones')
  addMilestone(
    @Param('projectId') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.addMilestone(projectId, dto, userId);
  }

  @Put(':projectId/milestones/:milestoneId')
  updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.updateMilestone(milestoneId, dto, userId);
  }

  // ---- 预警 ----
  @Get(':projectId/alerts')
  getAlerts(@Param('projectId') projectId: string) {
    return this.projectService.getAlerts(projectId);
  }

  @Put(':projectId/alerts/:alertId/resolve')
  resolveAlert(@Param('alertId') alertId: string) {
    return this.projectService.resolveAlert(alertId);
  }
}
