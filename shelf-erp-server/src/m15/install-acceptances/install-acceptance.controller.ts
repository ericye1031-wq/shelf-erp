import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstallAcceptanceService } from './install-acceptance.service';
import { CreateInstallAcceptanceDto, SubmitESignatureDto } from './dto/install-acceptance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M15-验收管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m15/acceptances')
export class InstallAcceptanceController {
  constructor(private readonly installAcceptanceService: InstallAcceptanceService) {}

  @Get('by-project/:projectId')
  getAcceptanceByProject(@Param('projectId') projectId: string) {
    return this.installAcceptanceService.getAcceptanceByProject(projectId);
  }

  @Get()
  findByPlanId(@Query('planId') planId: string) {
    return this.installAcceptanceService.findByPlanId(planId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installAcceptanceService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstallAcceptanceDto, @CurrentUser('id') userId: string) {
    return this.installAcceptanceService.create(dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installAcceptanceService.remove(id);
  }

  /** 提交电子签名 */
  @Post(':id/e-signature')
  submitESignature(
    @Param('id') id: string,
    @Body() dto: SubmitESignatureDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.installAcceptanceService.submitESignature(id, dto, userId);
  }

  /** 生成验收报告 */
  @Get('report/:planId')
  generateAcceptanceReport(@Param('planId') planId: string) {
    return this.installAcceptanceService.generateAcceptanceReport(planId);
  }
}
