import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BomItem } from './bom-item.entity';

export type BomStatus = 'draft' | 'released' | 'archived';
export type BomType = 'EBOM' | 'MBOM' | 'CBOM';

@Entity('boms')
export class BOM {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'bom_code', length: 30, unique: true, nullable: true })
  bomCode: string | null;

  @Column({ type: 'text', length: 200, nullable: true })
  name: string;

  @Column({ type: 'text', name: 'bom_type', length: 10, default: 'EBOM' })
  bomType: BomType;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'shelf_config_id', type: 'uuid', nullable: true })
  shelfConfigId: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: BomStatus;

  @Column({ name: 'total_weight', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalWeight: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => BomItem, (i) => i.bom)
  items: BomItem[];
}
