import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('quality_checks')
export class QualityCheck {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ name: 'process_step_id', type: 'uuid', nullable: true })
  processStepId: string;

  @Column({ name: 'inspector_id', type: 'uuid', nullable: true })
  inspectorId: string;

  @Column({ type: 'text', name: 'inspector_name', length: 50 })
  inspectorName: string;

  @Column({ type: 'text', length: 30 })
  type: string; // first_article | in_process | final

  @Column({ type: 'text', length: 20 })
  result: string; // pass | fail | conditional

  @Column({ name: 'checked_at', type: 'text' })
  checkedAt: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
