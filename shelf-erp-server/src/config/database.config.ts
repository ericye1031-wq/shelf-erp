import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * TypeORM 数据库配置
 * 根据 ConfigService 中的环境变量构建数据库连接配置
 * 支持 postgres 和 sqlite 两种模式（通过 DB_TYPE 环境变量切换）
 */
export function databaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isDevelopment = configService.get('NODE_ENV') !== 'production';
  const dbType = configService.get<string>('DB_TYPE', 'postgres');

  // SQLite 模式：无需 Docker/外部数据库，适合本地快速开发
  if (dbType === 'sqlite') {
    return {
      type: 'sqljs',
      autoSave: true,
      location: configService.get<string>('DATABASE_NAME', 'shelf_erp.sqlite'),
      useLocalForage: false,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: isDevelopment,
      logging: isDevelopment ? ['error', 'warn'] : ['error'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: false,
    };
  }

  // PostgreSQL 模式（生产/Docker 环境）
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    database: configService.get<string>('DATABASE_NAME', 'shelf_erp'),
    username: configService.get<string>('DATABASE_USER', 'erp'),
    password: configService.get<string>('DATABASE_PASSWORD', 'erp_dev_2025'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isDevelopment, // 生产环境必须使用迁移
    logging: isDevelopment ? ['error', 'warn'] : ['error'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
    extra: {
      // 连接池配置
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  };
}
