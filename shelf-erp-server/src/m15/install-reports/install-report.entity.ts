import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('install_reports')
export class InstallReport {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'text', name: 'worker_name', length: 50 })
  workerName: string;

  @Column({ name: 'work_date', type: 'date' })
  workDate: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 5, scale: 1, default: 0 })
  overtimeHours: number;

  @Column({ name: 'work_content', type: 'text', nullable: true })
  workContent: string | null;

  @Column({ name: 'completion_percent', type: 'decimal', precision: 5, scale: 1, default: 0 })
  completionPercent: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'team_id', type: 'uuid', nullable: true })
  teamId: string | null;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ name: 'photo_attachments', type: 'text', nullable: true })
  photoAttachments: string | null;

  @Column({ name: 'source', type: 'text', length: 20, default: 'web' })
  source: string;
}
