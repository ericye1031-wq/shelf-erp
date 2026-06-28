import { registerAs } from '@nestjs/config';

/**
 * JWT 配置
 * 读取环境变量并提供 JWT 相关配置
 */
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '2h',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
}));

/** JWT Payload 接口 */
export interface JwtPayload {
  sub: string; // 用户ID
  username: string;
  orgId: string | null;
}

/** 请求中附加的用户信息接口 */
export interface RequestUser {
  id: string;
  username: string;
  name?: string;        // 登录时从DB填充，JWT校验时不携带
  orgId: string | null;
  orgName?: string;     // 登录时从DB填充
  roles?: string[];
  permissions?: string[];
}
