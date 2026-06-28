import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTicket } from './service-ticket.entity';
import { ServiceTicketService } from './service-ticket.service';
import { ServiceTicketController } from './service-ticket.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceTicket])],
  providers: [ServiceTicketService],
  controllers: [ServiceTicketController],
})
export class ServiceTicketModule {}
