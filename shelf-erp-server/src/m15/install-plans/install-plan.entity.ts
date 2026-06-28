import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type InstallPlanStatus = 'draft' | 'submitted' | 'in_progress' | 'completed' | 'cancelled';

@Entity('install_plans')
export class InstallPlan {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ name: 'site_address', type: 'text' })
  siteAddress: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'safety_briefing', type: 'text', nullable: true })
  safetyBriefing: string | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: InstallPlanStatus;

  @Column({ name: 'accepted_by', type: 'uuid', nullable: true })
  acceptedBy: string | null;

  @Column({ name: 'accepted_at', type: 'text', nullable: true })
  acceptedAt: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
