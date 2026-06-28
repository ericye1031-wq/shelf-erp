import { Module } from '@nestjs/common';
import { CostModule } from './costs/cost.module';

@Module({
  imports: [CostModule],
  exports: [CostModule],
})
export class M12Module {}
