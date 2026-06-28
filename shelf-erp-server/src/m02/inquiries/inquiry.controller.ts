import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M02-询价管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m02/inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  findAll(@Query() dto: PaginationDto) {
    return this.inquiryService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inquiryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInquiryDto, @CurrentUser('id') userId: string) {
    return this.inquiryService.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto, @CurrentUser('id') userId: string) {
    return this.inquiryService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inquiryService.remove(id);
  }
}
