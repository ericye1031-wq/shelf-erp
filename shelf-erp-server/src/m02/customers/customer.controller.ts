import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateContactDto, UpdateContactDto } from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('M02-客户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('m02/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Permissions('m02:read')
  findAll(@Query() dto: PaginationDto) {
    return this.customerService.findAll(dto);
  }

  @Get(':id')
  @Permissions('m02:read')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Post()
  @Permissions('m02:create')
  create(@Body() dto: CreateCustomerDto, @CurrentUser('id') userId: string) {
    return this.customerService.create(dto, userId);
  }

  @Put(':id')
  @Permissions('m02:update')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @CurrentUser('id') userId: string) {
    return this.customerService.update(id, dto, userId);
  }

  @Delete(':id')
  @Permissions('m02:delete')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }

  // === Contacts ===
  @Get(':customerId/contacts')
  findContacts(@Param('customerId') customerId: string) {
    return this.customerService.findContacts(customerId);
  }

  @Post(':customerId/contacts')
  createContact(@Param('customerId') customerId: string, @Body() dto: CreateContactDto, @CurrentUser('id') userId: string) {
    return this.customerService.createContact(customerId, dto, userId);
  }

  @Put(':customerId/contacts/:id')
  updateContact(@Param('customerId') customerId: string, @Param('id') contactId: string, @Body() dto: UpdateContactDto, @CurrentUser('id') userId: string) {
    return this.customerService.updateContact(customerId, contactId, dto, userId);
  }

  @Delete(':customerId/contacts/:id')
  removeContact(@Param('customerId') customerId: string, @Param('id') contactId: string) {
    return this.customerService.removeContact(customerId, contactId);
  }
}
