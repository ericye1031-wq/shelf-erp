import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('schedule_items')
export class ScheduleItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ name: 'process_step_id', type: 'uuid' })
  processStepId: string;

  @Column({ name: 'equipment_id', type: 'uuid' })
  equipmentId: string;

  @Column({ type: 'text', name: 'equipment_name', length: 100 })
  equipmentName: string;

  @Column({ name: 'start_time', type: 'text' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'text' })
  endTime: Date;

  @Column({ type: 'text', length: 20, default: 'planned' })
  status: string; // planned | in_progress | completed | cancelled
}
