import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type AcceptanceResult = 'passed' | 'with_issues' | 'failed';

@Entity('install_acceptances')
export class InstallAcceptance {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ name: 'accept_date', type: 'date', nullable: true })
  acceptDate: Date | null;

  @Column({ name: 'customer_sign', type: 'text', nullable: true })
  customerSign: string | null;

  @Column({ type: 'text', length: 20, default: 'passed' })
  result: AcceptanceResult;

  @Column({ name: 'issue_desc', type: 'text', nullable: true })
  issueDesc: string | null;

  @Column({ name: 'warranty_start_date', type: 'date', nullable: true })
  warrantyStartDate: Date | null;

  @Column({ name: 'warranty_end_date', type: 'date', nullable: true })
  warrantyEndDate: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'e_signature', type: 'text', nullable: true })
  eSignature: string | null;

  @Column({ name: 'e_signature_date', type: 'text', nullable: true })
  eSignatureDate: Date | null;

  @Column({ name: 'report_data', type: 'text', nullable: true })
  reportData: string | null;
}
