import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../m01/users/user.entity';
import { UserRole, RolePermission } from '../m01/roles/role-relations.entity';
import { Role } from '../m01/roles/role.entity';
import { Permission } from '../m01/permissions/permission.entity';
import { Organization } from '../m01/organizations/organization.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // 异步注册 JwtModule，从环境变量读取 secret
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_EXPIRY || '2h',
        },
      }),
    }),
    TypeOrmModule.forFeature([User, UserRole, Role, RolePermission, Permission, Organization]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
