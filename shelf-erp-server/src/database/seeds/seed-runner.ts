import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { runM01Seed } from './m01-seed';
import { runBusinessSeed } from './business-seed';
import { runM10ProcessSeed } from './m10-process-seed';

// 加载 .env.local 环境变量
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * 种子数据运行器
 * 用于初始化系统所需的基础数据
 *
 * 使用方式: npm run seed
 * 支持 sqlite（本地）和 postgres（Docker）两种模式
 */
async function runSeeds(): Promise<void> {
  console.log('🌱 开始运行种子数据...');

  const dbType = process.env.DB_TYPE || 'postgres';

  // 创建数据源（根据 DB_TYPE 自动切换）
  const dataSource =
    dbType === 'sqlite'
      ? new DataSource({
          type: 'better-sqlite3',
          database: process.env.DATABASE_NAME || 'shelf_erp.sqlite',
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: true, // seed 时自动建表
        })
      : new DataSource({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          database: process.env.DATABASE_NAME || 'shelf_erp',
          username: process.env.DATABASE_USER || 'erp',
          password: process.env.DATABASE_PASSWORD || 'erp_dev_2025',
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: true,
        });

  try {
    await dataSource.initialize();
    console.log(`📦 数据库连接成功 (${dbType})`);

    // M01 系统管理种子
    await runM01Seed(dataSource);

    // 核心业务种子数据
    await runBusinessSeed(dataSource);

    // M10 工艺路线 + 工序 种子数据（SRS标准）
    await runM10ProcessSeed(dataSource, process.env.SEED_ADMIN_ID || '');

    console.log('✅ 种子数据运行完成');
  } catch (error) {
    console.error('❌ 种子数据运行失败:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// 直接运行
runSeeds().catch((error) => {
  console.error('❌ 种子数据运行失败:', error);
  process.exit(1);
});
