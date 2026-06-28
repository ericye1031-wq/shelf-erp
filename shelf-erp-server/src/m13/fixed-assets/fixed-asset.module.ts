import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedAsset } from './fixed-asset.entity';
import { FixedAssetService } from './fixed-asset.service';
import { FixedAssetController } from './fixed-asset.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FixedAsset])],
  controllers: [FixedAssetController],
  providers: [FixedAssetService],
  exports: [FixedAssetService],
})
export class FixedAssetModule {}
