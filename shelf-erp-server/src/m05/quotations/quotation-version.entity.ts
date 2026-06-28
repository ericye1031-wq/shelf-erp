import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quotation } from './quotation.entity';

@Entity('quotation_versions')
export class QuotationVersion {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'quotation_id', type: 'uuid' })
  quotationId: string;

  @Column()
  version: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  margin: number;

  @Column({ name: 'changed_fields', type: 'simple-array', nullable: true })
  changedFields: string[];

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => Quotation, (q) => q.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;
}
