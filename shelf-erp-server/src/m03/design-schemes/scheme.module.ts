import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scheme } from './scheme.entity';
import { SchemeVersion } from './scheme-version.entity';
import { SchemeService } from './scheme.service';
import { SchemeController } from './scheme.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme, SchemeVersion])],
  controllers: [SchemeController],
  providers: [SchemeService],
  exports: [SchemeService],
})
export class SchemeModule {}
