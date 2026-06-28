import { registerAs } from '@nestjs/config';

/**
 * Redis 配置
 * 读取环境变量并提供 Redis 连接配置
 */
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

/** Redis 连接 URL 构造器 */
export function getRedisUrl(config: {
  host: string;
  port: number;
  password?: string;
  db?: number;
}): string {
  const auth = config.password ? `:${config.password}@` : '';
  return `redis://${auth}${config.host}:${config.port}/${config.db ?? 0}`;
}
