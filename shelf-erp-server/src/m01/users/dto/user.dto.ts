import { IsString, IsOptional, IsEmail, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: '姓名' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '组织ID' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ description: '角色ID列表' })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '组织ID' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '角色ID列表' })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @MaxLength(100)
  newPassword: string;
}
