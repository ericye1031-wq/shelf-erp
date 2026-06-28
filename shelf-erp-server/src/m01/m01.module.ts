import { Module } from '@nestjs/common';
import { OrganizationModule } from './organizations/organization.module';
import { UserModule } from './users/user.module';
import { RoleModule } from './roles/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permissions/permission.entity';
import { RolePermission, UserRole } from './roles/role-relations.entity';
import { PermissionService } from './permissions/permission.service';
import { PermissionController } from './permissions/permission.controller';

@Module({
  imports: [
    OrganizationModule,
    UserModule,
    RoleModule,
    TypeOrmModule.forFeature([Permission, RolePermission, UserRole]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [OrganizationModule, UserModule, RoleModule, PermissionService],
})
export class M01Module {}
