import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallReport } from './install-report.entity';
import { InstallReportService } from './install-report.service';
import { InstallReportController } from './install-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallReport])],
  controllers: [InstallReportController],
  providers: [InstallReportService],
  exports: [InstallReportService],
})
export class InstallReportModule {}
