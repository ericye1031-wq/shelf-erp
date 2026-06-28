import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('bom_versions')
export class BomVersion {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'change_note', type: 'text', nullable: true })
  changeNote: string;

  @Column({ name: 'changed_item_ids', type: 'json', nullable: true })
  changedItemIds: string[];

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
