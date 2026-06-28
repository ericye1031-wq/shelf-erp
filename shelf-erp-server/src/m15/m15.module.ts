import { Module } from '@nestjs/common';
import { InstallPlanModule } from './install-plans/install-plan.module';
import { InstallTeamModule } from './install-teams/install-team.module';
import { InstallReportModule } from './install-reports/install-report.module';
import { InstallCostModule } from './install-costs/install-cost.module';
import { InstallIssueModule } from './install-issues/install-issue.module';
import { InstallAcceptanceModule } from './install-acceptances/install-acceptance.module';

@Module({
  imports: [
    InstallPlanModule,
    InstallTeamModule,
    InstallReportModule,
    InstallCostModule,
    InstallIssueModule,
    InstallAcceptanceModule,
  ],
  exports: [
    InstallPlanModule,
    InstallTeamModule,
    InstallReportModule,
    InstallCostModule,
    InstallIssueModule,
    InstallAcceptanceModule,
  ],
})
export class M15Module {}
