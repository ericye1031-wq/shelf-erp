import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 从请求中提取当前用户信息的装饰器
 * 使用方式: @CurrentUser() user: RequestUser
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了字段名，只返回该字段
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
