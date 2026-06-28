import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanRecord } from './scan-record.entity';
import { ScanRecordService } from './scan-record.service';
import { ScanRecordController } from './scan-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScanRecord])],
  controllers: [ScanRecordController],
  providers: [ScanRecordService],
  exports: [ScanRecordService],
})
export class ScanRecordModule {}
