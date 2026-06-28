import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type DrawingCategory = 'assembly' | 'component' | 'part' | 'installation' | 'foundation';
export type DrawingStatus = 'designing' | 'reviewing' | 'published' | 'obsolete';

@Entity('drawings')
export class Drawing {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'scheme_id', type: 'uuid', nullable: true })
  schemeId: string | null;

  @Column({ type: 'text', length: 20 })
  category: DrawingCategory;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ name: 'file_type', type: 'text', length: 50, nullable: true })
  fileType: string | null;

  @Column({ type: 'text', length: 20, default: 'designing' })
  status: DrawingStatus;

  @Column({ type: 'text', length: 20, default: 'V1.0' })
  version: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @CreateDateColumn({ name: 'uploaded_at', })
  uploadedAt: Date;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @Column({ name: 'parent_drawing_id', type: 'uuid', nullable: true })
  parentDrawingId: string | null;
}
