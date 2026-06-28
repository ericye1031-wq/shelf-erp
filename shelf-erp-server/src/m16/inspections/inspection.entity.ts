import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 巡检状态 */
export type InspectionStatus =
  | 'pending'     // 待巡检
  | 'processing'  // 巡检中
  | 'completed'   // 已完成
  | 'exception';  // 有异常

/** 巡检结果 */
export type InspectionResult = 'pass' | 'fail' | 'pending';

/** 巡检类型 */
export type InspectionType = 'routine' | 'special' | 'acceptance';

@Entity('m16_inspections')
@Index(['inspectionNo'], { unique: true })
@Index(['status'])
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'inspection_no', length: 50 })
  inspectionNo: string;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'text', default: 'routine' })
  inspectionType: InspectionType;

  @Column({ type: 'text', name: 'equipment_id', nullable: true })
  equipmentId: string;

  @Column({ type: 'text', name: 'equipment_name', length: 200, nullable: true })
  equipmentName: string;

  @Column({ type: 'text', name: 'inspector', nullable: true })
  inspector: string;

  @Column({ type: 'text', name: 'inspector_name', length: 100, nullable: true })
  inspectorName: string;

  @Column({ type: 'text', default: 'pending' })
  result: InspectionResult;

  @Column({ type: 'text', name: 'issue_desc', nullable: true })
  issueDesc: string;

  @Column({ type: 'text', name: 'handle_suggestion', nullable: true })
  handleSuggestion: string;

  @Column({ type: 'text', default: 'pending' })
  status: InspectionStatus;

  @Column({ type: 'text', name: 'inspected_at', nullable: true })
  inspectedAt: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
