import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('shelf_configs')
export class ShelfConfig {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'shelf_type_id', type: 'uuid' })
  shelfTypeId: string;

  @Column({ type: 'text', name: 'shelf_type_name', length: 100, nullable: true })
  shelfTypeName: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, string | number>;

  @Column({ type: 'text', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
