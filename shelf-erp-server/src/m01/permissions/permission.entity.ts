import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('permissions')
export class Permission {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', length: 20 })
  type: string; // menu, button, data

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'text', default: 0 })
  sort: number;

  // Relations
  @ManyToOne(() => Permission, (p) => p.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Permission;

  @OneToMany(() => Permission, (p) => p.parent)
  children: Permission[];
}
