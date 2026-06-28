import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式拦截器
 * 将控制器返回值包装为 { code: 0, data, message: 'ok' } 格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        message: 'ok',
      })),
    );
  }
}

/** 统一响应类型 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
