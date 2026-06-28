import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type AccountCategory = '资产' | '负债' | '权益' | '成本' | '损益';
export type BalanceDirection = 'debit' | 'credit';
export type AccountStatus = 'active' | 'inactive';

@Entity('accounts')
export class Account {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 20, unique: true })
  code: string;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'text', length: 10 })
  category: AccountCategory;

  @Column({ type: 'text', name: 'balance_direction', length: 10, default: 'debit' })
  balanceDirection: BalanceDirection;

  @Column({ type: 'text', name: 'is_leaf', default: true })
  isLeaf: boolean;

  @Column({ type: 'text', name: 'has_aux', default: false })
  hasAux: boolean;

  @Column({ name: 'aux_types', type: 'text', nullable: true })
  auxTypes: string | null;

  @Column({ type: 'text', length: 10, default: 'active' })
  status: AccountStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @ManyToOne(() => Account, (a) => a.children, { nullable: true })
  parent: Account | null;

  @OneToMany(() => Account, (a) => a.parent)
  children: Account[];
}
