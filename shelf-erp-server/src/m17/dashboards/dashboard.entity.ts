import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DashboardType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  INVENTORY = 'inventory',
  FINANCE = 'finance',
  PROJECT = 'project',
  CUSTOM = 'custom',
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  KPI = 'kpi',
  GAUGE = 'gauge',
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
}

@Entity('m17_dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  dashboardNo: string; // 仪表板编号 DASH-YYYYMMDD-XXX

  @Column({ length: 100 })
  name: string; // 仪表板名称

  @Column({ length: 500, nullable: true })
  description: string; // 描述

  @Column({
    type: 'text',
    default: DashboardType.CUSTOM,
  })
  type: string; // 仪表板类型

  @Column({ type: 'simple-json', nullable: true })
  layout: any; // 布局配置 JSON

  @Column({ type: 'simple-json', nullable: true })
  widgets: any[]; // 组件配置数组 JSON

  @Column({ default: false })
  isPublic: boolean; // 是否公开

  @Column({ length: 50 })
  createdBy: string; // 创建人

  @Column({ length: 50, nullable: true })
  updatedBy: string; // 更新人

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
