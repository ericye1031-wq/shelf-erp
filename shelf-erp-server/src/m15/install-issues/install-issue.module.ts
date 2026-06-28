import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallIssue } from './install-issue.entity';
import { InstallIssueService } from './install-issue.service';
import { InstallIssueController } from './install-issue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallIssue])],
  controllers: [InstallIssueController],
  providers: [InstallIssueService],
  exports: [InstallIssueService],
})
export class InstallIssueModule {}
