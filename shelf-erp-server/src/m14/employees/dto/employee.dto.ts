import { IsString, IsOptional, IsDateString, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: '员工姓名' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female'] })
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @ApiPropertyOptional({ description: '出生日期' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  idNumber?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '入职日期' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departmentName?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: '员工姓名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departmentName?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}
