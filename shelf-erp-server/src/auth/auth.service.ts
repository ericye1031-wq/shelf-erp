import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../m01/users/user.entity';
import { UserRole } from '../m01/roles/role-relations.entity';
import { RolePermission } from '../m01/roles/role-relations.entity';
import { Role } from '../m01/roles/role.entity';
import { Permission } from '../m01/permissions/permission.entity';
import { Organization } from '../m01/organizations/organization.entity';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtPayload, RequestUser } from '../config/jwt.config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: RequestUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly urRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /** 用户登录 */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const tokens = await this.generateTokenPair(user);
    const requestUser = await this.buildRequestUser(user);

    return {
      ...tokens,
      user: requestUser,
    };
  }

  /** 用户注册 */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException(`用户名 ${dto.username} 已存在`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      name: dto.name,
      createdBy: 'system',
      updatedBy: 'system',
    });
    const saved = await this.userRepo.save(user);

    // 如果指定了角色编码，分配角色
    if (dto.roleCode) {
      const role = await this.roleRepo.findOne({
        where: { code: dto.roleCode },
      });
      if (role) {
        await this.urRepo.save({
          userId: saved.id,
          roleId: role.id,
        });
      }
    }

    const tokens = await this.generateTokenPair(saved);
    const requestUser = await this.buildRequestUser(saved);

    return {
      ...tokens,
      user: requestUser,
    };
  }

  /** 刷新 Token */
  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      return this.generateTokenPair(user);
    } catch {
      throw new UnauthorizedException('Refresh Token无效或已过期');
    }
  }

  /** 获取当前用户信息 */
  async me(userId: string): Promise<RequestUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.buildRequestUser(user);
  }

  /** 生成 Token 对 */
  private async generateTokenPair(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      orgId: user.orgId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY', '2h'),
      }),
      this.jwtService.signAsync(
        { ...payload, tokenType: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /** 构建 RequestUser（含 name / orgName / permissions） */
  private async buildRequestUser(user: User): Promise<RequestUser> {
    // 获取用户角色
    const userRoles = await this.urRepo.find({ where: { userId: user.id } });
    const roleIds = userRoles.map((ur) => ur.roleId);

    // 获取角色编码
    const roleCodes: string[] = [];
    const permissionCodes: string[] = [];
    if (roleIds.length > 0) {
      const roles = await this.roleRepo.findByIds(roleIds);
      roles.forEach((r) => roleCodes.push(r.code));

      // admin 角色拥有全部权限（通配符 *）
      if (roleCodes.includes('admin')) {
        permissionCodes.push('*');
      } else {
        // 获取角色关联的权限
        const rps = await this.rpRepo.find({ where: { roleId: In(roleIds) } });
        const permIds = rps.map((rp) => rp.permissionId);
        if (permIds.length > 0) {
          const perms = await this.permRepo.findByIds(permIds);
          perms.forEach((p) => permissionCodes.push(p.code));
        }
      }
    }

    // 获取组织名称
    let orgName: string | undefined;
    if (user.orgId) {
      const org = await this.orgRepo.findOne({ where: { id: user.orgId } });
      orgName = org?.name;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      orgId: user.orgId,
      orgName,
      roles: roleCodes,
      permissions: permissionCodes,
    };
  }
}
