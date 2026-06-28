import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Contact } from './contact.entity';
import { CreateCustomerDto, UpdateCustomerDto, CreateContactDto, UpdateContactDto } from './dto/customer.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.customerRepo.createQueryBuilder('c');
    if (keyword) {
      qb.andWhere('(c.name LIKE :kw OR c.code LIKE :kw OR c.shortName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('c.status = :status', { status });
    if (sortBy) qb.orderBy(`c.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('c.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id }, relations: ['contacts'] });
    if (!customer) throw new NotFoundException(`客户 ${id} 不存在`);
    return customer;
  }

  async create(dto: CreateCustomerDto, userId: string): Promise<Customer> {
    const existing = await this.customerRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`客户编码 ${dto.code} 已存在`);
    const customer = this.customerRepo.create({ ...dto, createdBy: userId, updatedBy: userId });
    return this.customerRepo.save(customer);
  }

  async update(id: string, dto: UpdateCustomerDto, userId: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`客户 ${id} 不存在`);
    if (dto.code && dto.code !== customer.code) {
      const existing = await this.customerRepo.findOne({ where: { code: dto.code } });
      if (existing) throw new ConflictException(`客户编码 ${dto.code} 已存在`);
    }
    Object.assign(customer, dto, { updatedBy: userId });
    return this.customerRepo.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`客户 ${id} 不存在`);
    await this.customerRepo.remove(customer);
  }

  // === Contact methods ===
  async findContacts(customerId: string): Promise<Contact[]> {
    return this.contactRepo.find({ where: { customerId }, order: { isPrimary: 'DESC', createdAt: 'DESC' } });
  }

  async createContact(customerId: string, dto: CreateContactDto, userId: string): Promise<Contact> {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`客户 ${customerId} 不存在`);
    const contact = this.contactRepo.create({ ...dto, customerId, createdBy: userId, updatedBy: userId });
    return this.contactRepo.save(contact);
  }

  async updateContact(customerId: string, contactId: string, dto: UpdateContactDto, userId: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({ where: { id: contactId, customerId } });
    if (!contact) throw new NotFoundException(`联系人 ${contactId} 不存在`);
    Object.assign(contact, dto, { updatedBy: userId });
    return this.contactRepo.save(contact);
  }

  async removeContact(customerId: string, contactId: string): Promise<void> {
    const contact = await this.contactRepo.findOne({ where: { id: contactId, customerId } });
    if (!contact) throw new NotFoundException(`联系人 ${contactId} 不存在`);
    await this.contactRepo.remove(contact);
  }
}
