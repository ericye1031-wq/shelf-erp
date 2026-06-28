import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type FixedAssetStatus = 'in_use' | 'idle' | 'maintenance' | 'disposed';

@Entity('fixed_assets')
export class FixedAsset {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'asset_code', type: 'text', length: 30, unique: true })
  assetCode: string;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'text', length: 30 })
  category: string;

  @Column({ name: 'purchase_date', type: 'text' })
  purchaseDate: string;

  @Column({ name: 'original_value', type: 'decimal', precision: 12, scale: 2 })
  originalValue: number;

  @Column({ name: 'residual_rate', type: 'decimal', precision: 5, scale: 4, default: 0.05 })
  residualRate: number;

  @Column({ name: 'depreciation_years', type: 'int' })
  depreciationYears: number;

  @Column({
    name: 'monthly_depreciation',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  monthlyDepreciation: number;

  @Column({
    name: 'accumulated_depreciation',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  accumulatedDepreciation: number;

  @Column({
    name: 'net_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  netValue: number;

  @Column({ type: 'text', length: 20, default: 'in_use' })
  status: FixedAssetStatus;

  @Column({ type: 'text', length: 50, nullable: true })
  custodian: string | null;

  @Column({ type: 'text', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
