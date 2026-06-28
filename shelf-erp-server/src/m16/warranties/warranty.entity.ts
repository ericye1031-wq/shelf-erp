import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 质保状态 */
export type WarrantyStatus =
  | 'active'      // 有效
  | 'expiring'    // 即将到期
  | 'expired'     // 已过期
  | 'void';       // 已作废

/** 质保类型 */
export type WarrantyType = 'full' | 'parts' | 'labor';

@Entity('m16_warranties')
@Index(['warrantyNo'], { unique: true })
@Index(['status'])
export class Warranty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'warranty_no', length: 50 })
  warrantyNo: string;

  @Column({ type: 'text', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', name: 'product_name', length: 200 })
  productName: string;

  @Column({ type: 'text', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200 })
  customerName: string;

  @Column({ type: 'text', name: 'start_date' })
  startDate: string;

  @Column({ type: 'text', name: 'end_date' })
  endDate: string;

  @Column({ type: 'text', default: 'full' })
  warrantyType: WarrantyType;

  @Column({ type: 'text', default: 'active' })
  status: WarrantyStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
