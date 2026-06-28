import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReportType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  INVENTORY = 'inventory',
  FINANCE = 'finance',
  PROJECT = 'project',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  TABLE = 'table',
  CHART = 'chart',
  PIVOT = 'pivot',
  SUMMARY = 'summary',
}

@Entity('m17_reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  reportNo: string; // 报表编号 RPT-YYYYMMDD-XXX

  @Column({ length: 100 })
  name: string; // 报表名称

  @Column({ length: 500, nullable: true })
  description: string; // 描述

  @Column({
    type: 'text',
    default: ReportType.CUSTOM,
  })
  type: string; // 报表类型

  @Column({
    type: 'text',
    default: ReportFormat.TABLE,
  })
  format: string; // 报表格式

  @Column({ type: 'text', nullable: true })
  sqlQuery: string; // SQL查询语句

  @Column({ type: 'simple-json', nullable: true })
  parameters: any; // 参数配置 JSON

  @Column({ type: 'simple-json', nullable: true })
  columns: any[]; // 列配置 JSON

  @Column({ type: 'simple-json', nullable: true })
  filters: any[]; // 筛选条件 JSON

  @Column({ type: 'simple-json', nullable: true })
  chartConfig: any; // 图表配置 JSON

  @Column({ default: false })
  isPublic: boolean; // 是否公开

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
