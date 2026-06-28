import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './jwt.config';
import { redisConfig } from './redis.config';

/**
 * 应用配置模块
 * 注册所有配置提供者
 */
@Module({
  imports: [
    // JWT 配置
    ConfigModule.forFeature(jwtConfig),
    // Redis 配置
    ConfigModule.forFeature(redisConfig),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
