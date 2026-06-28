import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DataSourceType {
  SQLITE = 'sqlite',
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  SQLSERVER = 'sqlserver',
  ORACLE = 'oracle',
  API = 'api',
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('m17_data_sources')
export class DataSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  sourceNo: string; // 数据源编号 DS-YYYYMMDD-XXX

  @Column({ length: 100 })
  name: string; // 数据源名称

  @Column({ length: 500, nullable: true })
  description: string; // 描述

  @Column({
    type: 'text',
    default: DataSourceType.SQLITE,
  })
  type: string; // 数据源类型

  @Column({ type: 'text', nullable: true })
  connectionString: string; // 连接字符串

  @Column({ type: 'simple-json', nullable: true })
  config: any; // 配置信息 JSON

  @Column({ default: true })
  isActive: boolean; // 是否启用

  @Column({ default: false })
  isDefault: boolean; // 是否默认数据源

  @Column({ length: 50, nullable: true })
  lastTestAt: string; // 最后测试时间

  @Column({ default: false })
  lastTestSuccess: boolean; // 最后测试结果

  @Column({ length: 50 })
  createdBy: string; // 创建人

  @Column({ length: 50, nullable: true })
  updatedBy: string; // 更新人

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
