import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Scheme } from './scheme.entity';

@Entity('scheme_versions')
export class SchemeVersion {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'scheme_id', type: 'uuid' })
  schemeId: string;

  @ManyToOne(() => Scheme, (s) => s.versions)
  @JoinColumn({ name: 'scheme_id' })
  scheme: Scheme;

  @Column({ type: 'text', name: 'version_no', length: 20 })
  versionNo: string;

  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary: string;

  @Column({ type: 'text', nullable: true })
  attachments: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approved_at', type: 'text', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;
}
