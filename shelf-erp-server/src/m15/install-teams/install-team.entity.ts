import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type WorkerRole = '队长' | '安装工' | '助手';
export type CertStatus = 'valid' | 'expired' | 'none';
export type InsuranceStatus = 'active' | 'expired' | 'none';

@Entity('install_teams')
export class InstallTeam {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'text', name: 'worker_name', length: 50 })
  workerName: string;

  @Column({ type: 'text', name: 'worker_role', length: 20 })
  workerRole: WorkerRole;

  @Column({ type: 'text', name: 'cert_status', length: 20, default: 'none' })
  certStatus: CertStatus;

  @Column({ type: 'text', name: 'insurance_status', length: 20, default: 'none' })
  insuranceStatus: InsuranceStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;
}
