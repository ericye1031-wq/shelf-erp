import { Module } from '@nestjs/common';
import { SchemeModule } from './design-schemes/scheme.module';
import { DrawingModule } from './drawings/drawing.module';

@Module({
  imports: [SchemeModule, DrawingModule],
  exports: [SchemeModule, DrawingModule],
})
export class M03Module {}
