import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type IssueType = '缺件' | '损坏' | '设计变更' | '客户追加需求' | '其他';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

@Entity('install_issues')
export class InstallIssue {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'text', name: 'issue_type', length: 20 })
  issueType: IssueType;

  @Column({ type: 'text', length: 20, default: 'low' })
  severity: IssueSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'photo_urls', type: 'simple-json', nullable: true })
  photoUrls: string[];

  @Column({ type: 'text', length: 20, default: 'open' })
  status: IssueStatus;

  @Column({ name: 'resolved_at', type: 'text', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  solution: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;
}
