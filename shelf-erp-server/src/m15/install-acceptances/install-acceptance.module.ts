import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallAcceptance } from './install-acceptance.entity';
import { InstallAcceptanceService } from './install-acceptance.service';
import { InstallAcceptanceController } from './install-acceptance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallAcceptance])],
  controllers: [InstallAcceptanceController],
  providers: [InstallAcceptanceService],
  exports: [InstallAcceptanceService],
})
export class InstallAcceptanceModule {}
