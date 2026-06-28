import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一 API 响应 DTO
 * 所有接口响应都遵循此格式
 */
export class ApiResponseDto<T> {
  @ApiProperty({ description: '状态码，0表示成功', example: 0 })
  code: number;

  @ApiProperty({ description: '响应数据' })
  data: T;

  @ApiProperty({ description: '响应消息', example: 'ok' })
  message: string;
}

/**
 * 分页响应数据 DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表', isArray: true })
  items: T[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  pageSize: number;
}
