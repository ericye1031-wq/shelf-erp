import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum KPIType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  INVENTORY = 'inventory',
  FINANCE = 'finance',
  PROJECT = 'project',
  CUSTOM = 'custom',
}

export enum KPIUnit {
  COUNT = 'count',
  AMOUNT = 'amount',
  PERCENTAGE = 'percentage',
  DAYS = 'days',
  RATIO = 'ratio',
}

export enum KPITrend {
  UP = 'up',
  DOWN = 'down',
  FLAT = 'flat',
}

@Entity('m17_kpis')
export class KPI {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  kpiNo: string; // KPI编号 KPI-YYYYMMDD-XXX

  @Column({ length: 100 })
  name: string; // KPI名称

  @Column({ length: 500, nullable: true })
  description: string; // 描述

  @Column({
    type: 'text',
    default: KPIType.CUSTOM,
  })
  type: string; // KPI类型

  @Column({
    type: 'text',
    default: KPIUnit.COUNT,
  })
  unit: string; // 单位

  @Column({ type: 'text' })
  calculation: string; // 计算方式/公式

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  target: number; // 目标值

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actual: number; // 实际值

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  achievementRate: number; // 达成率(%)

  @Column({
    type: 'text',
    default: KPITrend.FLAT,
  })
  trend: string; // 趋势

  @Column({ length: 50, nullable: true })
  trendValue: string; // 趋势值

  @Column({ default: true })
  isActive: boolean; // 是否启用

  @Column({ length: 50 })
  createdBy: string; // 创建人

  @Column({ length: 50, nullable: true })
  updatedBy: string; // 更新人

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
