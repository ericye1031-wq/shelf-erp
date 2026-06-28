import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type SupplierStatus = 'active' | 'inactive';
export type SupplierRating = 'A' | 'B' | 'C' | 'D';

@Entity('suppliers')
export class Supplier {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ type: 'text', name: 'tax_id', length: 50, nullable: true })
  taxId: string | null;

  @Column({ name: 'supply_categories', type: 'text', nullable: true })
  supplyCategories: string | null;

  @Column({ type: 'text', name: 'contact_name', length: 50, nullable: true })
  contactName: string | null;

  @Column({ type: 'text', name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'text', name: 'contact_email', length: 100, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'text', name: 'bank_account', length: 50, nullable: true })
  bankAccount: string | null;

  @Column({ type: 'text', name: 'bank_name', length: 100, nullable: true })
  bankName: string | null;

  @Column({ type: 'text', length: 1, default: 'C' })
  rating: SupplierRating;

  @Column({ type: 'text', length: 10, default: 'active' })
  status: SupplierStatus;

  @Column({ type: 'text', nullable: true })
  address: string | null;

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
}
