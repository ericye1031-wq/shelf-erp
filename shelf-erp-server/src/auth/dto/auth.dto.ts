import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MaxLength(100)
  password: string;
}

export class RegisterDto {
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

  @ApiProperty({ description: '角色编码', required: false })
  @IsString()
  roleCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}
