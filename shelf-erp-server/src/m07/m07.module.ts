import { Module } from '@nestjs/common';
import { ProjectModule } from './projects/project.module';

@Module({
  imports: [ProjectModule],
  exports: [ProjectModule],
})
export class M07Module {}
