import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 维修状态 */
export type RepairStatus =
  | 'pending'     // 待维修
  | 'processing'  // 维修中
  | 'completed'   // 已完成
  | 'cancelled';  // 已取消

/** 故障等级 */
export type FaultLevel = 'low' | 'medium' | 'high' | 'critical';

@Entity('m16_repairs')
@Index(['repairNo'], { unique: true })
@Index(['status'])
export class Repair {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'repair_no', length: 50 })
  repairNo: string;

  @Column({ type: 'text', name: 'ticket_id', nullable: true })
  ticketId: string;

  @Column({ type: 'text', name: 'equipment_id', nullable: true })
  equipmentId: string;

  @Column({ type: 'text', name: 'equipment_name', length: 200, nullable: true })
  equipmentName: string;

  @Column({ type: 'text', name: 'fault_desc' })
  faultDesc: string;

  @Column({ type: 'text', name: 'fault_level', default: 'medium' })
  faultLevel: FaultLevel;

  @Column({ type: 'text', name: 'repair_desc', nullable: true })
  repairDesc: string;

  @Column({ type: 'text', name: 'parts_used', nullable: true })
  partsUsed: string;

  @Column({ type: 'real', name: 'repair_cost', nullable: true })
  repairCost: number;

  @Column({ type: 'real', name: 'labor_cost', nullable: true })
  laborCost: number;

  @Column({ type: 'real', name: 'parts_cost', nullable: true })
  partsCost: number;

  @Column({ type: 'text', default: 'pending' })
  status: RepairStatus;

  @Column({ type: 'text', name: 'repair_by', nullable: true })
  repairBy: string;

  @Column({ type: 'text', name: 'repair_by_name', length: 100, nullable: true })
  repairByName: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
