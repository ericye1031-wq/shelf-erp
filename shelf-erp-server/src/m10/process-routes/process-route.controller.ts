import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessRouteService } from './process-route.service';
import { ProcessRoute } from './process-route.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M10-工艺路线')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m10/process-routes')
export class ProcessRouteController {
  constructor(private readonly service: ProcessRouteService) {}

  @Get()
  findAll(@Query('shelfTypeId') shelfTypeId?: string) {
    return this.service.findAll(shelfTypeId);
  }

  @Post()
  create(@Body() data: Partial<ProcessRoute>, @CurrentUser('id') userId: string) {
    return this.service.create(data, userId);
  }
}
