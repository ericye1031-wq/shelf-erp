import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallTeam } from './install-team.entity';
import { InstallTeamService } from './install-team.service';
import { InstallTeamController } from './install-team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallTeam])],
  controllers: [InstallTeamController],
  providers: [InstallTeamService],
  exports: [InstallTeamService],
})
export class InstallTeamModule {}
