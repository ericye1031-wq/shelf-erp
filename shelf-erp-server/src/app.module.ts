import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config/config.module';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { M01Module } from './m01/m01.module';
import { M02Module } from './m02/m02.module';
import { M03Module } from './m03/m03.module';
import { M04Module } from './m04/m04.module';
import { M05Module } from './m05/m05.module';
import { M06Module } from './m06/m06.module';
import { M07Module } from './m07/m07.module';
import { M08Module } from './m08/m08.module';
import { M09Module } from './m09/m09.module';
import { M10Module } from './m10/m10.module';
import { M11Module } from './m11/m11.module';
import { M12Module } from './m12/m12.module';
import { M13Module } from './m13/m13.module';
import { M15Module } from './m15/m15.module';
import { M14Module } from './m14/m14.module';
import { M16Module } from './m16/m16.module';
import { M17Module } from './m17/m17.module';
import { M18Module } from './m18/m18.module';
import { M19Module } from './m19/m19.module';
import { M20Module } from './m20/m20.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
    }),

    // 应用配置模块
    AppConfigModule,

    // 认证模块（全局注册 JwtModule，JwtService 所有模块可用）
    AuthModule,

    // M01 系统管理模块
    M01Module,

    // M02 客户询价模块
    M02Module,

    // M03 方案设计+图文档模块
    M03Module,

    // M04 产品管理模块
    M04Module,

    // M05 报价管理模块
    M05Module,

    // M06 合同管理模块
    M06Module,

    // M07 项目管理模块
    M07Module,

    // M08 采购管理模块
    M08Module,

    // M09 采购管理+SRM模块
    M09Module,

    // M10 生产管理模块
    M10Module,

    // M11 仓储管理模块
    M11Module,

    // M12 成本核算模块
    M12Module,

    // M13 财务总账模块
    M13Module,

    // M15 安装管理模块
    M15Module,

    // M14 HR人力资源管理模块
    M14Module,

    // M16 售后服务模块
    M16Module,

    // M17 BI商业智能模块
    M17Module,

    // M18 AI自动报价模块
    M18Module,

    // M19 AI智能排产模块
    M19Module,

    // M20 AI成本预测模块
    M20Module,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
