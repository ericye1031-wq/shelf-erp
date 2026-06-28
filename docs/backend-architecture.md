# 货架ERP后端架构设计文档

> 版本: v1.0  
> 日期: 2026-06-17  
> 作者: 架构师 - 高见远(Gao)

---

## 目录

1. [技术栈选型](#1-技术栈选型)
2. [项目目录结构](#2-项目目录结构)
3. [数据库表结构设计](#3-数据库表结构设计)
4. [RESTful API 接口设计](#4-restful-api-接口设计)
5. [认证方案](#5-认证方案)
6. [与前端的对接方案](#6-与前端的对接方案)
7. [部署方案](#7-部署方案)
8. [核心业务流程](#8-核心业务流程)
9. [任务分解](#9-任务分解)

---

## 1. 技术栈选型

### 1.1 推荐方案: NestJS + TypeORM + PostgreSQL

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| **运行时** | Node.js 20 LTS | 前后端统一语言，团队学习成本低 |
| **框架** | NestJS 10 | 模块化架构、装饰器驱动、内置DI/IoC，与Angular思想一致，企业级成熟度 |
| **ORM** | TypeORM 0.3 | TypeScript原生支持、装饰器实体定义、迁移机制成熟、与NestJS深度集成 |
| **数据库** | PostgreSQL 16 | 企业级关系数据库，支持JSONB(参数模板存储)、数组类型、全文搜索，性能优于MySQL |
| **认证** | Passport + JWT | NestJS官方推荐，策略模式易扩展，支持多种认证方式 |
| **校验** | class-validator + class-transformer | NestJS内置管道，装饰器校验，与DTO天然配合 |
| **API文档** | Swagger(@nestjs/swagger) | 自动生成OpenAPI文档，前端可在线调试 |
| **日志** | Winston | 企业级日志，支持多传输、日志轮转 |
| **缓存** | Redis 7 | 会话管理、数据缓存、分布式锁 |
| **测试** | Jest + Supertest | NestJS默认测试框架，单元测试+E2E测试 |

### 1.2 关键选型决策

**为什么选NestJS而不是Express/Koa？**
- ERP系统模块多、业务复杂，NestJS的模块化架构天然适合多模块组织
- 内置Guard/Interceptor/Pipe等管道，标准化请求处理流程
- 装饰器驱动的DI容器，代码可测试性强
- 社区活跃，企业级项目验证充分

**为什么选PostgreSQL而不是MySQL？**
- `parameterTemplate`和`parameters`等字段为半结构化数据，PostgreSQL的JSONB类型原生支持，无需额外表
- 数组类型支持（如`roleIds`、`permissionIds`、`alternativeIds`），简化关联设计
- 更强的查询优化器和并发处理能力
- 对ERP这类复杂查询场景更优

**为什么选TypeORM而不是Prisma？**
- TypeORM支持装饰器定义实体，与NestJS装饰器风格一致
- 动态查询构建器(QueryBuilder)更适合ERP复杂查询场景
- 迁移机制更成熟，支持增量迁移
- 社区更大，ERP类项目实践更多

---

## 2. 项目目录结构

```
shelf-erp-server/
├── .env                          # 环境变量(本地开发)
├── .env.example                  # 环境变量示例
├── .eslintrc.js                  # ESLint配置
├── nest-cli.json                 # NestJS CLI配置
├── tsconfig.json                 # TypeScript配置
├── tsconfig.build.json           # 构建专用TS配置
├── package.json                  # 依赖声明
├── README.md
│
├── src/
│   ├── main.ts                   # 应用入口
│   ├── app.module.ts             # 根模块
│   │
│   ├── common/                   # 公共模块
│   │   ├── decorators/           # 自定义装饰器
│   │   │   ├── current-user.decorator.ts
│   │   │   └── permissions.decorator.ts
│   │   ├── filters/              # 异常过滤器
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/               # 守卫
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/         # 拦截器
│   │   │   ├── transform.interceptor.ts    # 统一响应格式
│   │   │   └── logging.interceptor.ts      # 请求日志
│   │   ├── pipes/                # 管道
│   │   │   └── validation.pipe.ts
│   │   ├── dto/                  # 公共DTO
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── entities/             # 公共实体基类
│   │   │   ├── base.entity.ts              # 含audit字段
│   │   │   └── soft-delete.entity.ts
│   │   └── utils/                # 工具函数
│   │       ├── code-generator.util.ts      # 单号生成器
│   │       └── formula-parser.util.ts      # 公式解析器
│   │
│   ├── config/                   # 配置模块
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   │
│   ├── auth/                     # 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── m01/                      # 系统管理模块
│   │   ├── m01.module.ts
│   │   ├── organizations/
│   │   │   ├── organization.entity.ts
│   │   │   ├── organization.controller.ts
│   │   │   ├── organization.service.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   ├── roles/
│   │   │   ├── role.entity.ts
│   │   │   ├── role.controller.ts
│   │   │   ├── role.service.ts
│   │   │   └── dto/
│   │   ├── permissions/
│   │   │   ├── permission.entity.ts
│   │   │   └── permission.seed.ts
│   │   ├── dictionaries/
│   │   │   ├── dictionary.entity.ts
│   │   │   ├── dictionary.controller.ts
│   │   │   ├── dictionary.service.ts
│   │   │   └── dto/
│   │   ├── logs/
│   │   │   ├── system-log.entity.ts
│   │   │   ├── system-log.controller.ts
│   │   │   └── system-log.service.ts
│   │   └── configs/
│   │       ├── system-config.entity.ts
│   │       ├── system-config.controller.ts
│   │       ├── system-config.service.ts
│   │       └── dto/
│   │
│   ├── m02/                      # 客户与询价模块
│   │   ├── m02.module.ts
│   │   ├── customers/
│   │   │   ├── customer.entity.ts
│   │   │   ├── contact.entity.ts
│   │   │   ├── customer.controller.ts
│   │   │   ├── customer.service.ts
│   │   │   └── dto/
│   │   ├── opportunities/
│   │   │   ├── opportunity.entity.ts
│   │   │   ├── opportunity.controller.ts
│   │   │   ├── opportunity.service.ts
│   │   │   └── dto/
│   │   ├── inquiries/
│   │   │   ├── inquiry.entity.ts
│   │   │   ├── inquiry.controller.ts
│   │   │   ├── inquiry.service.ts
│   │   │   └── dto/
│   │   └── followups/
│   │       ├── follow-up.entity.ts
│   │       ├── follow-up.controller.ts
│   │       ├── follow-up.service.ts
│   │       └── dto/
│   │
│   ├── m04/                      # 产品/货架型号模块
│   │   ├── m04.module.ts
│   │   ├── shelf-types/
│   │   │   ├── shelf-type.entity.ts
│   │   │   ├── shelf-type.controller.ts
│   │   │   ├── shelf-type.service.ts
│   │   │   └── dto/
│   │   ├── shelf-configs/
│   │   │   ├── shelf-config.entity.ts
│   │   │   ├── shelf-config.controller.ts
│   │   │   ├── shelf-config.service.ts
│   │   │   └── dto/
│   │   ├── specifications/
│   │   │   ├── specification.entity.ts
│   │   │   ├── specification.controller.ts
│   │   │   ├── specification.service.ts
│   │   │   └── dto/
│   │   └── bom-calculator/
│   │       ├── bom-calculator.service.ts      # BOM计算引擎
│   │       └── formula-engine.ts              # 公式解析与计算
│   │
│   ├── m05/                      # 报价管理模块
│   │   ├── m05.module.ts
│   │   ├── quotations/
│   │   │   ├── quotation.entity.ts
│   │   │   ├── quotation-version.entity.ts
│   │   │   ├── cost-item.entity.ts
│   │   │   ├── quotation.controller.ts
│   │   │   ├── quotation.service.ts
│   │   │   └── dto/
│   │   └── currencies/
│   │       ├── currency.entity.ts
│   │       ├── currency.controller.ts
│   │       └── currency.service.ts
│   │
│   ├── m06/                      # 合同管理模块
│   │   ├── m06.module.ts
│   │   ├── contracts/
│   │   │   ├── contract.entity.ts
│   │   │   ├── contract.controller.ts
│   │   │   ├── contract.service.ts
│   │   │   └── dto/
│   │   ├── payments/
│   │   │   ├── payment-plan.entity.ts
│   │   │   ├── payment-plan.controller.ts
│   │   │   ├── payment-plan.service.ts
│   │   │   └── dto/
│   │   └── invoices/
│   │       ├── invoice.entity.ts
│   │       ├── invoice.controller.ts
│   │       ├── invoice.service.ts
│   │       └── dto/
│   │
│   ├── m07/                      # 项目管理模块
│   │   ├── m07.module.ts
│   │   ├── projects/
│   │   │   ├── project.entity.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── project.service.ts
│   │   │   └── dto/
│   │   ├── milestones/
│   │   │   ├── milestone.entity.ts
│   │   │   ├── milestone.controller.ts
│   │   │   └── milestone.service.ts
│   │   ├── gantt/
│   │   │   ├── gantt-task.entity.ts
│   │   │   ├── gantt-task.controller.ts
│   │   │   └── gantt-task.service.ts
│   │   └── alerts/
│   │       ├── alert.entity.ts
│   │       ├── alert.controller.ts
│   │       └── alert.service.ts
│   │
│   ├── m08/                      # BOM管理模块
│   │   ├── m08.module.ts
│   │   ├── boms/
│   │   │   ├── bom.entity.ts
│   │   │   ├── bom-item.entity.ts
│   │   │   ├── bom-version.entity.ts
│   │   │   ├── bom.controller.ts
│   │   │   ├── bom.service.ts
│   │   │   └── dto/
│   │   └── alternatives/
│   │       ├── alternative-material.entity.ts
│   │       ├── alternative-material.controller.ts
│   │       └── alternative-material.service.ts
│   │
│   ├── m10/                      # 生产管理模块
│   │   ├── m10.module.ts
│   │   ├── work-orders/
│   │   │   ├── work-order.entity.ts
│   │   │   ├── work-order.controller.ts
│   │   │   ├── work-order.service.ts
│   │   │   └── dto/
│   │   ├── process-steps/
│   │   │   ├── process-step.entity.ts
│   │   │   └── process-step.service.ts
│   │   ├── schedule/
│   │   │   ├── schedule-item.entity.ts
│   │   │   ├── schedule.controller.ts
│   │   │   └── schedule.service.ts
│   │   ├── scan-records/
│   │   │   ├── scan-record.entity.ts
│   │   │   ├── scan-record.controller.ts
│   │   │   └── scan-record.service.ts
│   │   ├── equipment/
│   │   │   ├── equipment.entity.ts
│   │   │   ├── equipment.controller.ts
│   │   │   └── equipment.service.ts
│   │   ├── quality/
│   │   │   ├── quality-check.entity.ts
│   │   │   ├── defect.entity.ts
│   │   │   ├── quality-check.controller.ts
│   │   │   └── quality-check.service.ts
│   │   ├── oee/
│   │   │   ├── oee-data.entity.ts
│   │   │   ├── oee.controller.ts
│   │   │   └── oee.service.ts
│   │   ├── process-routes/
│   │   │   ├── process-route.entity.ts
│   │   │   ├── process-route.controller.ts
│   │   │   └── process-route.service.ts
│   │   └── material-demands/
│   │       ├── material-demand.entity.ts
│   │       ├── material-demand.controller.ts
│   │       └── material-demand.service.ts
│   │
│   ├── m11/                      # 库存管理模块
│   │   ├── m11.module.ts
│   │   ├── warehouses/
│   │   │   ├── warehouse.entity.ts
│   │   │   ├── warehouse-location.entity.ts
│   │   │   ├── warehouse.controller.ts
│   │   │   ├── warehouse.service.ts
│   │   │   └── dto/
│   │   ├── batches/
│   │   │   ├── batch.entity.ts
│   │   │   ├── batch.controller.ts
│   │   │   ├── batch.service.ts
│   │   │   └── dto/
│   │   ├── inventory/
│   │   │   ├── inventory-item.entity.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── dto/
│   │   └── pda/
│   │       ├── pda-operation.entity.ts
│   │       ├── pda-operation.controller.ts
│   │       └── pda-operation.service.ts
│   │
│   ├── m12/                      # 成本核算模块
│   │   ├── m12.module.ts
│   │   ├── dimensions/
│   │   │   ├── cost-dimension.entity.ts
│   │   │   ├── cost-dimension.controller.ts
│   │   │   ├── cost-dimension.service.ts
│   │   │   └── dto/
│   │   ├── variances/
│   │   │   ├── cost-variance.entity.ts
│   │   │   └── cost-variance.service.ts
│   │   └── alerts/
│   │       ├── cost-alert.entity.ts
│   │       ├── cost-alert.controller.ts
│   │       └── cost-alert.service.ts
│   │
│   └── database/                 # 数据库相关
│       ├── migrations/           # 迁移文件
│       └── seeds/                # 种子数据
│           ├── seed-runner.ts
│           ├── m01-seed.ts
│           ├── m02-seed.ts
│           └── ...
│
├── test/                         # 测试
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
└── docker-compose.yml            # 本地开发环境
```

---

## 3. 数据库表结构设计

### 3.1 公共基类

所有业务表继承以下基础字段：

```sql
-- 审计字段（嵌入各表）
created_by  UUID        NOT NULL
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_by  UUID        NOT NULL
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### 3.2 核心表设计

#### M01 - 系统管理

```sql
-- 组织机构（树形结构）
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  parent_id   UUID REFERENCES organizations(id),
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('group','company','factory','department')),
  contact     VARCHAR(50),
  phone       VARCHAR(30),
  address     VARCHAR(200),
  status      VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','cancelled')),
  sort        INTEGER      NOT NULL DEFAULT 0,
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_org_parent ON organizations(parent_id);
CREATE INDEX idx_org_code ON organizations(code);

-- 用户
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(200) NOT NULL,  -- bcrypt hash
  name        VARCHAR(50)  NOT NULL,
  phone       VARCHAR(30),
  email       VARCHAR(100),
  org_id      UUID REFERENCES organizations(id),
  avatar      VARCHAR(500),
  status      VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 用户-角色关联
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 角色
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50)  NOT NULL,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(200),
  status      VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 角色-权限关联
CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 权限（树形结构）
CREATE TABLE permissions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(50)  NOT NULL,
  code      VARCHAR(100) NOT NULL UNIQUE,
  type      VARCHAR(20)  NOT NULL CHECK (type IN ('menu','button','data')),
  parent_id UUID REFERENCES permissions(id),
  sort      INTEGER      NOT NULL DEFAULT 0
);

-- 数据字典
CREATE TABLE dictionaries (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category  VARCHAR(50)  NOT NULL,
  code      VARCHAR(50)  NOT NULL,
  label     VARCHAR(100) NOT NULL,
  value     VARCHAR(200) NOT NULL,
  sort      INTEGER      NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES dictionaries(id),
  remark    VARCHAR(200),
  UNIQUE(category, code)
);
CREATE INDEX idx_dict_category ON dictionaries(category);

-- 系统日志
CREATE TABLE system_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  user_name  VARCHAR(50),
  module     VARCHAR(50),
  action     VARCHAR(50),
  ip         VARCHAR(50),
  detail     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_syslog_created ON system_logs(created_at);
CREATE INDEX idx_syslog_user ON system_logs(user_id);

-- 系统配置
CREATE TABLE system_configs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key       VARCHAR(100) NOT NULL UNIQUE,
  value     TEXT         NOT NULL,
  label     VARCHAR(100),
  config_group  VARCHAR(50),  -- "group" 是SQL保留字
  remark    VARCHAR(200),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### M02 - 客户与询价

```sql
-- 客户
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  short_name  VARCHAR(50),
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('direct','agent','distributor')),
  industry    VARCHAR(50),
  region      VARCHAR(50),
  level       CHAR(1)      NOT NULL CHECK (level IN ('A','B','C','D')),
  source      VARCHAR(50),
  status      VARCHAR(20)  NOT NULL DEFAULT 'active',
  project_id  UUID,
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_customer_code ON customers(code);

-- 联系人
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name        VARCHAR(50)  NOT NULL,
  position    VARCHAR(50),
  phone       VARCHAR(30),
  email       VARCHAR(100),
  is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
  remark      VARCHAR(200),
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contact_customer ON contacts(customer_id);

-- 商机
CREATE TABLE opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id),
  customer_name VARCHAR(200),  -- 冗余字段，避免频繁JOIN
  title         VARCHAR(200) NOT NULL,
  amount        DECIMAL(14,2),
  stage         VARCHAR(20)  NOT NULL CHECK (stage IN ('initial','qualification','proposal','negotiation','closed_won','closed_lost')),
  probability   DECIMAL(3,2) DEFAULT 0,
  expected_date DATE,
  description   TEXT,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active',
  project_id    UUID,
  created_by    UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_opp_customer ON opportunities(customer_id);

-- 询价单
CREATE TABLE inquiries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(50)  NOT NULL UNIQUE,  -- INQ202501001
  customer_id    UUID NOT NULL REFERENCES customers(id),
  customer_name  VARCHAR(200),
  opportunity_id UUID REFERENCES opportunities(id),
  shelf_type     VARCHAR(100),
  requirement    TEXT,
  quantity       INTEGER      NOT NULL DEFAULT 0,
  unit           VARCHAR(20),
  delivery_date  DATE,
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft',
  project_id     UUID,
  created_by     UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by     UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inquiry_code ON inquiries(code);

-- 跟进记录
CREATE TABLE follow_ups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id),
  opportunity_id UUID REFERENCES opportunities(id),
  type           VARCHAR(20) NOT NULL CHECK (type IN ('call','visit','email','wechat','other')),
  content        TEXT        NOT NULL,
  next_action    VARCHAR(200),
  next_date      DATE,
  created_by     UUID NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### M04 - 产品/货架型号

```sql
-- 货架类型
CREATE TABLE shelf_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(100) NOT NULL,
  code                VARCHAR(50)  NOT NULL UNIQUE,
  category            VARCHAR(50),
  description         TEXT,
  parameter_template  JSONB,       -- ParameterDef[] 以JSONB存储
  status              VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_by          UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON COLUMN shelf_types.parameter_template IS '参数定义模板，格式: [{key,label,type,unit,required,options,defaultValue,min,max}]';

-- 货架配置
CREATE TABLE shelf_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_type_id   UUID NOT NULL REFERENCES shelf_types(id),
  shelf_type_name VARCHAR(100),  -- 冗余
  name            VARCHAR(200) NOT NULL,
  parameters      JSONB,          -- Record<string, string|number> 以JSONB存储
  status          VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_config_shelf_type ON shelf_configs(shelf_type_id);

-- 规格定义
CREATE TABLE specifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_type_id         UUID NOT NULL REFERENCES shelf_types(id),
  name                  VARCHAR(100) NOT NULL,
  parameter_constraints JSONB,         -- 参数约束
  structure_template    JSONB,         -- 结构模板 StructureNode[]
  created_by            UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by            UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_spec_shelf_type ON specifications(shelf_type_id);
```

#### M05 - 报价管理

```sql
-- 币种
CREATE TABLE currencies (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code   VARCHAR(10) NOT NULL UNIQUE,
  name   VARCHAR(50) NOT NULL,
  symbol VARCHAR(10),
  rate   DECIMAL(10,4) NOT NULL DEFAULT 1.0
);

-- 报价单
CREATE TABLE quotations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50)   NOT NULL UNIQUE,  -- QT202501001
  inquiry_id      UUID REFERENCES inquiries(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  customer_name   VARCHAR(200),
  shelf_type_id   UUID REFERENCES shelf_types(id),
  shelf_type_name VARCHAR(100),
  config_id       UUID REFERENCES shelf_configs(id),
  config_name     VARCHAR(200),
  quantity        INTEGER       NOT NULL DEFAULT 0,
  unit_price      DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_price     DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency_id     UUID REFERENCES currencies(id),
  exchange_rate   DECIMAL(10,4) DEFAULT 1.0,
  margin          DECIMAL(5,4)  DEFAULT 0,
  delivery_days   INTEGER       DEFAULT 0,
  valid_until     DATE,
  version         INTEGER       NOT NULL DEFAULT 1,
  status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
  remark          TEXT,
  project_id      UUID,
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_quotation_code ON quotations(code);
CREATE INDEX idx_quotation_inquiry ON quotations(inquiry_id);

-- 报价成本项
CREATE TABLE cost_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id  UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  category      VARCHAR(20) NOT NULL CHECK (category IN ('material','labor','overhead','outsourcing','logistics','other')),
  name          VARCHAR(100) NOT NULL,
  amount        DECIMAL(14,2) NOT NULL DEFAULT 0,
  unit          VARCHAR(20),
  remark        VARCHAR(200),
  sort          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_cost_item_quotation ON cost_items(quotation_id);

-- 报价版本
CREATE TABLE quotation_versions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id   UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  version        INTEGER       NOT NULL,
  unit_price     DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_price    DECIMAL(14,2) NOT NULL DEFAULT 0,
  margin         DECIMAL(5,4)  DEFAULT 0,
  changed_fields TEXT[],         -- 变更字段数组
  remark         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     UUID NOT NULL,
  UNIQUE(quotation_id, version)
);
```

#### M06 - 合同管理

```sql
-- 合同
CREATE TABLE contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(50)   NOT NULL UNIQUE,  -- CT202501001
  quotation_id  UUID REFERENCES quotations(id),
  project_id    UUID,
  customer_id   UUID NOT NULL REFERENCES customers(id),
  customer_name VARCHAR(200),
  title         VARCHAR(200) NOT NULL,
  amount        DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency_id   UUID REFERENCES currencies(id),
  sign_date     DATE,
  delivery_date DATE,
  payment_terms VARCHAR(100),
  status        VARCHAR(20)   NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft','reviewing','approved','executing','completed','terminated')),
  terms         TEXT,
  project_id    UUID,
  created_by    UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contract_code ON contracts(code);

-- 回款计划
CREATE TABLE payment_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id  UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  stage        VARCHAR(100) NOT NULL,
  amount       DECIMAL(14,2) NOT NULL DEFAULT 0,
  ratio        DECIMAL(5,4)  DEFAULT 0,
  planned_date DATE,
  actual_date  DATE,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue')),
  remark       VARCHAR(200),
  created_by   UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payment_contract ON payment_plans(contract_id);

-- 发票
CREATE TABLE invoices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('normal','special')),
  amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_rate    DECIMAL(5,4)  DEFAULT 0,
  tax_amount  DECIMAL(14,2) DEFAULT 0,
  issued_date DATE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','issued','cancelled')),
  remark      VARCHAR(200),
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### M07 - 项目管理

```sql
-- 项目
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(50)   NOT NULL UNIQUE,  -- PRJ202501001
  name         VARCHAR(200)  NOT NULL,
  contract_id  UUID REFERENCES contracts(id),
  customer_id  UUID REFERENCES customers(id),
  customer_name VARCHAR(200),
  manager_id   UUID REFERENCES users(id),
  manager_name VARCHAR(50),
  start_date   DATE,
  end_date     DATE,
  progress     INTEGER       DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status       VARCHAR(20)   NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning','in_progress','paused','completed','cancelled')),
  description  TEXT,
  created_by   UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 里程碑
CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  planned_date DATE,
  actual_date  DATE,
  progress    INTEGER DEFAULT 0,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','overdue')),
  description TEXT,
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 甘特任务
CREATE TABLE gantt_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  progress    INTEGER DEFAULT 0,
  parent_id   UUID REFERENCES gantt_tasks(id),
  assignee    VARCHAR(50),
  color       VARCHAR(20),
  dependency  UUID REFERENCES gantt_tasks(id)
);

-- 预警
CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id),
  type         VARCHAR(20) NOT NULL CHECK (type IN ('deadline','cost','quality','resource','custom')),
  level        VARCHAR(20) NOT NULL CHECK (level IN ('info','warning','critical')),
  title        VARCHAR(200) NOT NULL,
  content      TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);
```

#### M08 - BOM管理

```sql
-- BOM
CREATE TABLE boms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id),
  shelf_config_id UUID REFERENCES shelf_configs(id),
  version         INTEGER NOT NULL DEFAULT 1,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
  total_weight    DECIMAL(14,2) DEFAULT 0,
  total_cost      DECIMAL(14,2) DEFAULT 0,
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BOM项
CREATE TABLE bom_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id          UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  part_code       VARCHAR(50)  NOT NULL,
  part_name       VARCHAR(100) NOT NULL,
  material        VARCHAR(50),
  spec            VARCHAR(100),
  quantity        DECIMAL(14,2) NOT NULL DEFAULT 0,
  unit            VARCHAR(20),
  length          DECIMAL(10,2) DEFAULT 0,
  weight          DECIMAL(10,2) DEFAULT 0,
  unit_cost       DECIMAL(14,2) DEFAULT 0,
  total_cost      DECIMAL(14,2) DEFAULT 0,
  waste_rate      DECIMAL(5,4)  DEFAULT 0,
  parent_id       UUID REFERENCES bom_items(id),
  level           INTEGER NOT NULL DEFAULT 1,
  sort            INTEGER NOT NULL DEFAULT 0,
  remark          VARCHAR(200)
);
CREATE INDEX idx_bom_item_bom ON bom_items(bom_id);

-- BOM版本
CREATE TABLE bom_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id          UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  change_note     TEXT,
  changed_item_ids UUID[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID NOT NULL,
  UNIQUE(bom_id, version)
);

-- 替代料
CREATE TABLE alternative_materials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_item_id  UUID NOT NULL REFERENCES bom_items(id) ON DELETE CASCADE,
  part_code         VARCHAR(50)  NOT NULL,
  part_name         VARCHAR(100) NOT NULL,
  material          VARCHAR(50),
  spec              VARCHAR(100),
  priority          INTEGER DEFAULT 1,
  price_diff        DECIMAL(14,2) DEFAULT 0,
  available         BOOLEAN DEFAULT TRUE,
  remark            VARCHAR(200)
);
```

#### M10 - 生产管理

```sql
-- 工单
CREATE TABLE work_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50)  NOT NULL UNIQUE,  -- WO202501001
  project_id      UUID REFERENCES projects(id),
  bom_id          UUID REFERENCES boms(id),
  shelf_config_id UUID REFERENCES shelf_configs(id),
  quantity        INTEGER NOT NULL DEFAULT 0,
  completed_qty   INTEGER DEFAULT 0,
  priority        VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','released','in_progress','completed','closed')),
  planned_start   DATE,
  planned_end     DATE,
  actual_start    DATE,
  actual_end      DATE,
  project_id      UUID,
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 工序
CREATE TABLE process_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id   UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  step_code       VARCHAR(20) NOT NULL,
  step_name       VARCHAR(50) NOT NULL,
  sequence        INTEGER NOT NULL DEFAULT 1,
  equipment_id    UUID REFERENCES equipment(id),
  equipment_name  VARCHAR(50),
  planned_minutes INTEGER,
  actual_minutes  INTEGER,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','skipped')),
  operator_id     UUID REFERENCES users(id),
  operator_name   VARCHAR(50),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_pstep_work_order ON process_steps(work_order_id);

-- 设备
CREATE TABLE equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(50)  NOT NULL UNIQUE,
  type            VARCHAR(50),
  workshop        VARCHAR(50),
  status          VARCHAR(20) NOT NULL DEFAULT 'idle' CHECK (status IN ('running','idle','maintenance','breakdown')),
  capacity        INTEGER DEFAULT 100,
  current_load    INTEGER DEFAULT 0,
  next_maintenance DATE,
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 排程项
CREATE TABLE schedule_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id   UUID NOT NULL REFERENCES work_orders(id),
  process_step_id UUID NOT NULL REFERENCES process_steps(id),
  equipment_id    UUID NOT NULL REFERENCES equipment(id),
  equipment_name  VARCHAR(50),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','started','completed','delayed'))
);

-- 报工记录
CREATE TABLE scan_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id   UUID NOT NULL REFERENCES work_orders(id),
  process_step_id UUID NOT NULL REFERENCES process_steps(id),
  operator_id     UUID NOT NULL REFERENCES users(id),
  operator_name   VARCHAR(50),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('start','pause','complete','defect')),
  quantity        INTEGER DEFAULT 0,
  defect_qty      INTEGER DEFAULT 0,
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remark          VARCHAR(200)
);

-- 质检记录
CREATE TABLE quality_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id   UUID NOT NULL REFERENCES work_orders(id),
  process_step_id UUID NOT NULL REFERENCES process_steps(id),
  inspector_id    UUID NOT NULL REFERENCES users(id),
  inspector_name  VARCHAR(50),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('in_process','final')),
  result          VARCHAR(20) NOT NULL CHECK (result IN ('pass','fail','conditional')),
  checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remark          VARCHAR(200)
);

-- 缺陷
CREATE TABLE defects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_check_id UUID NOT NULL REFERENCES quality_checks(id) ON DELETE CASCADE,
  type             VARCHAR(50),
  description      TEXT,
  severity         VARCHAR(20) NOT NULL CHECK (severity IN ('minor','major','critical')),
  quantity         INTEGER DEFAULT 0,
  resolved         BOOLEAN DEFAULT FALSE
);

-- OEE数据
CREATE TABLE oee_data (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id  UUID NOT NULL REFERENCES equipment(id),
  equipment_name VARCHAR(50),
  date          DATE NOT NULL,
  availability  DECIMAL(5,4) DEFAULT 0,
  performance   DECIMAL(5,4) DEFAULT 0,
  quality       DECIMAL(5,4) DEFAULT 0,
  oee           DECIMAL(5,4) DEFAULT 0,
  planned_time  INTEGER DEFAULT 0,
  run_time      INTEGER DEFAULT 0,
  ideal_cycle   DECIMAL(10,2) DEFAULT 0,
  actual_cycle  DECIMAL(10,2) DEFAULT 0,
  total_output  INTEGER DEFAULT 0,
  good_output   INTEGER DEFAULT 0,
  UNIQUE(equipment_id, date)
);

-- 工艺路线
CREATE TABLE process_routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  shelf_type_id UUID REFERENCES shelf_types(id),
  steps         JSONB,       -- ProcessRouteStep[] JSONB存储
  created_by    UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 物料需求
CREATE TABLE material_demands (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id  UUID NOT NULL REFERENCES work_orders(id),
  bom_item_id    UUID REFERENCES bom_items(id),
  material       VARCHAR(50) NOT NULL,
  spec           VARCHAR(100),
  required_qty   DECIMAL(14,2) DEFAULT 0,
  available_qty  DECIMAL(14,2) DEFAULT 0,
  shortage_qty   DECIMAL(14,2) DEFAULT 0,
  unit           VARCHAR(20),
  planned_date   DATE,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','allocated','shortage'))
);
```

#### M11 - 库存管理

```sql
-- 仓库
CREATE TABLE warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('原料仓','半成品仓','成品仓','辅料仓','退货仓')),
  address     VARCHAR(200),
  manager_id  UUID REFERENCES users(id),
  manager_name VARCHAR(50),
  status      VARCHAR(20) NOT NULL DEFAULT 'active',
  created_by  UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 库位
CREATE TABLE warehouse_locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  code         VARCHAR(50) NOT NULL,
  name         VARCHAR(100),
  zone         VARCHAR(20),
  row_num      VARCHAR(10),   -- "row" 是SQL保留字
  col_num      VARCHAR(10),   -- "column" 是SQL保留字
  layer        VARCHAR(10),
  type         VARCHAR(20) NOT NULL CHECK (type IN ('storage','picking','staging','buffer')),
  status       VARCHAR(20) NOT NULL DEFAULT 'active',
  UNIQUE(warehouse_id, code)
);
CREATE INDEX idx_location_warehouse ON warehouse_locations(warehouse_id);

-- 批次
CREATE TABLE batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) NOT NULL UNIQUE,
  material        VARCHAR(50) NOT NULL,
  spec            VARCHAR(100),
  supplier        VARCHAR(100),
  quantity        DECIMAL(14,2) DEFAULT 0,
  remaining_qty   DECIMAL(14,2) DEFAULT 0,
  unit            VARCHAR(20),
  production_date DATE,
  expiry_date     DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'in_inspection' 
    CHECK (status IN ('in_inspection','qualified','unqualified','frozen')),
  location_id     UUID REFERENCES warehouse_locations(id),
  location_code   VARCHAR(50),
  created_by      UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 库存项
CREATE TABLE inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material       VARCHAR(50) NOT NULL,
  spec           VARCHAR(100),
  warehouse_id   UUID REFERENCES warehouses(id),
  warehouse_name VARCHAR(100),
  location_id    UUID REFERENCES warehouse_locations(id),
  location_code  VARCHAR(50),
  batch_id       UUID REFERENCES batches(id),
  batch_code     VARCHAR(50),
  quantity       DECIMAL(14,2) DEFAULT 0,
  unit           VARCHAR(20),
  safety_stock   DECIMAL(14,2) DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal','low','overstock','frozen')),
  last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inventory_material ON inventory_items(material, spec);

-- PDA操作记录
CREATE TABLE pda_operations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         VARCHAR(20) NOT NULL CHECK (type IN ('inbound','outbound','transfer','check','freeze','unfreeze')),
  operator_id  UUID NOT NULL REFERENCES users(id),
  operator_name VARCHAR(50),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  location_id  UUID REFERENCES warehouse_locations(id),
  batch_id     UUID REFERENCES batches(id),
  material     VARCHAR(50),
  spec         VARCHAR(100),
  quantity     DECIMAL(14,2) DEFAULT 0,
  unit         VARCHAR(20),
  reference_no VARCHAR(50),
  operated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remark       VARCHAR(200)
);
```

#### M12 - 成本核算

```sql
-- 成本维度
CREATE TABLE cost_dimensions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id),
  category         VARCHAR(20) NOT NULL CHECK (category IN ('material','labor','overhead','outsourcing','logistics','other')),
  budget_amount    DECIMAL(14,2) DEFAULT 0,
  actual_amount    DECIMAL(14,2) DEFAULT 0,
  committed_amount DECIMAL(14,2) DEFAULT 0,
  remaining_budget DECIMAL(14,2) DEFAULT 0,
  unit             VARCHAR(20),
  period           VARCHAR(20),
  project_id       UUID,
  created_by       UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by       UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cost_dim_project ON cost_dimensions(project_id);

-- 成本差异
CREATE TABLE cost_variances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id),
  dimension_id  UUID NOT NULL REFERENCES cost_dimensions(id),
  category      VARCHAR(20),
  budget_amount DECIMAL(14,2) DEFAULT 0,
  actual_amount DECIMAL(14,2) DEFAULT 0,
  variance      DECIMAL(14,2) DEFAULT 0,
  variance_rate DECIMAL(8,4) DEFAULT 0,
  reason        TEXT,
  period        VARCHAR(20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 成本预警
CREATE TABLE cost_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id),
  dimension_id UUID NOT NULL REFERENCES cost_dimensions(id),
  category     VARCHAR(20),
  type         VARCHAR(30) NOT NULL CHECK (type IN ('over_budget','approaching_budget','unusual_spending')),
  level        VARCHAR(20) NOT NULL CHECK (level IN ('info','warning','critical')),
  threshold    DECIMAL(10,4) DEFAULT 0,
  actual_value DECIMAL(14,2) DEFAULT 0,
  message      TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ,
  resolved_by  UUID
);
```

### 3.3 ER关系概览

```mermaid
erDiagram
  organizations ||--o{ organizations : parent
  organizations ||--o{ users : org
  users ||--o{ user_roles : user
  roles ||--o{ user_roles : role
  roles ||--o{ role_permissions : role
  permissions ||--o{ role_permissions : permission
  permissions ||--o{ permissions : parent
  
  customers ||--o{ contacts : customer
  customers ||--o{ opportunities : customer
  customers ||--o{ inquiries : customer
  customers ||--o{ follow_ups : customer
  opportunities ||--o{ inquiries : opportunity
  
  shelf_types ||--o{ shelf_configs : shelfType
  shelf_types ||--o{ specifications : shelfType
  shelf_types ||--o{ process_routes : shelfType
  shelf_configs ||--o{ quotations : config
  shelf_configs ||--o{ boms : config
  shelf_configs ||--o{ work_orders : config
  
  inquiries ||--o{ quotations : inquiry
  quotations ||--o{ cost_items : quotation
  quotations ||--o{ quotation_versions : quotation
  quotations ||--o{ contracts : quotation
  
  contracts ||--o{ payment_plans : contract
  contracts ||--o{ invoices : contract
  contracts ||--o{ projects : contract
  
  projects ||--o{ milestones : project
  projects ||--o{ gantt_tasks : project
  projects ||--o{ alerts : project
  projects ||--o{ boms : project
  projects ||--o{ work_orders : project
  projects ||--o{ cost_dimensions : project
  
  boms ||--o{ bom_items : bom
  bom_items ||--o{ alternative_materials : originalItem
  boms ||--o{ bom_versions : bom
  bom_items ||--o{ bom_items : parent
  
  work_orders ||--o{ process_steps : workOrder
  work_orders ||--o{ schedule_items : workOrder
  work_orders ||--o{ scan_records : workOrder
  work_orders ||--o{ quality_checks : workOrder
  work_orders ||--o{ material_demands : workOrder
  quality_checks ||--o{ defects : qualityCheck
  
  equipment ||--o{ process_steps : equipment
  equipment ||--o{ schedule_items : equipment
  equipment ||--o{ oee_data : equipment
  
  warehouses ||--o{ warehouse_locations : warehouse
  warehouses ||--o{ inventory_items : warehouse
  warehouse_locations ||--o{ batches : location
  batches ||--o{ inventory_items : batch
  pda_operations }o--|| warehouses : warehouse
```

---

## 4. RESTful API 接口设计

### 4.1 统一响应格式

```typescript
// 成功响应
{ code: 0, data: T, message: 'ok' }

// 分页响应
{ code: 0, data: { items: T[], total: number, page: number, pageSize: number }, message: 'ok' }

// 错误响应
{ code: number, data: null, message: string }
// code: 400=参数错误, 401=未认证, 403=无权限, 404=不存在, 409=冲突, 500=服务器错误
```

### 4.2 各模块API列表

#### Auth - 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录，返回JWT |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/refresh` | 刷新Token |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/auth/me` | 获取当前用户信息 |

#### M01 - 系统管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m01/organizations` | 组织列表(支持分页/树形) |
| GET | `/api/m01/organizations/:id` | 组织详情 |
| POST | `/api/m01/organizations` | 创建组织 |
| PUT | `/api/m01/organizations/:id` | 更新组织 |
| DELETE | `/api/m01/organizations/:id` | 删除组织 |
| GET | `/api/m01/organizations/tree` | 组织树 |
| GET | `/api/m01/users` | 用户列表 |
| GET | `/api/m01/users/:id` | 用户详情 |
| POST | `/api/m01/users` | 创建用户 |
| PUT | `/api/m01/users/:id` | 更新用户 |
| DELETE | `/api/m01/users/:id` | 删除用户 |
| PUT | `/api/m01/users/:id/password` | 修改密码 |
| GET | `/api/m01/roles` | 角色列表 |
| GET | `/api/m01/roles/:id` | 角色详情 |
| POST | `/api/m01/roles` | 创建角色 |
| PUT | `/api/m01/roles/:id` | 更新角色 |
| DELETE | `/api/m01/roles/:id` | 删除角色 |
| GET | `/api/m01/permissions` | 权限列表 |
| GET | `/api/m01/permissions/tree` | 权限树 |
| GET | `/api/m01/dictionaries` | 字典列表 |
| POST | `/api/m01/dictionaries` | 创建字典项 |
| PUT | `/api/m01/dictionaries/:id` | 更新字典项 |
| DELETE | `/api/m01/dictionaries/:id` | 删除字典项 |
| GET | `/api/m01/logs` | 系统日志列表 |
| GET | `/api/m01/configs` | 系统配置列表 |
| PUT | `/api/m01/configs/:id` | 更新配置 |

#### M02 - 客户与询价

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m02/customers` | 客户列表 |
| GET | `/api/m02/customers/:id` | 客户详情 |
| POST | `/api/m02/customers` | 创建客户 |
| PUT | `/api/m02/customers/:id` | 更新客户 |
| DELETE | `/api/m02/customers/:id` | 删除客户 |
| GET | `/api/m02/customers/:customerId/contacts` | 客户联系人列表 |
| POST | `/api/m02/customers/:customerId/contacts` | 创建联系人 |
| PUT | `/api/m02/customers/:customerId/contacts/:id` | 更新联系人 |
| DELETE | `/api/m02/customers/:customerId/contacts/:id` | 删除联系人 |
| GET | `/api/m02/opportunities` | 商机列表 |
| GET | `/api/m02/opportunities/:id` | 商机详情 |
| POST | `/api/m02/opportunities` | 创建商机 |
| PUT | `/api/m02/opportunities/:id` | 更新商机 |
| DELETE | `/api/m02/opportunities/:id` | 删除商机 |
| PATCH| `/api/m02/opportunities/:id/stage` | 更新商机阶段 |
| GET | `/api/m02/inquiries` | 询价列表 |
| GET | `/api/m02/inquiries/:id` | 询价详情 |
| POST | `/api/m02/inquiries` | 创建询价 |
| PUT | `/api/m02/inquiries/:id` | 更新询价 |
| DELETE | `/api/m02/inquiries/:id` | 删除询价 |
| GET | `/api/m02/followups` | 跟进记录列表 |
| POST | `/api/m02/followups` | 创建跟进记录 |

#### M04 - 产品/货架型号

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m04/shelf-types` | 货架类型列表 |
| GET | `/api/m04/shelf-types/:id` | 货架类型详情 |
| POST | `/api/m04/shelf-types` | 创建货架类型 |
| PUT | `/api/m04/shelf-types/:id` | 更新货架类型 |
| DELETE | `/api/m04/shelf-types/:id` | 删除货架类型 |
| GET | `/api/m04/configs` | 货架配置列表 |
| GET | `/api/m04/configs/:id` | 配置详情 |
| POST | `/api/m04/configs` | 创建配置 |
| PUT | `/api/m04/configs/:id` | 更新配置 |
| DELETE | `/api/m04/configs/:id` | 删除配置 |
| POST | `/api/m04/configs/:configId/calculate-bom` | **BOM计算**(核心业务) |
| POST | `/api/m04/configs/:configId/match-spec` | 规格匹配 |
| GET | `/api/m04/shelf-types/:shelfTypeId/specifications` | 货架类型规格列表 |
| POST | `/api/m04/specifications` | 创建规格 |
| PUT | `/api/m04/specifications/:id` | 更新规格 |

#### M05 - 报价管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m05/quotations` | 报价列表 |
| GET | `/api/m05/quotations/:id` | 报价详情 |
| POST | `/api/m05/quotations` | 创建报价 |
| PUT | `/api/m05/quotations/:id` | 更新报价 |
| DELETE | `/api/m05/quotations/:id` | 删除报价 |
| POST | `/api/m05/quotations/:id/submit` | **提交报价**(状态变更) |
| GET | `/api/m05/quotations/:quotationId/versions` | 报价版本列表 |
| GET | `/api/m05/quotations/:quotationId/compare?v1=&v2=` | **版本对比** |
| GET | `/api/m05/quotations/:quotationId/cost-items` | 报价成本项列表 |
| GET | `/api/m05/currencies` | 币种列表 |

#### M06 - 合同管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m06/contracts` | 合同列表 |
| GET | `/api/m06/contracts/:id` | 合同详情 |
| POST | `/api/m06/contracts` | 创建合同 |
| PUT | `/api/m06/contracts/:id` | 更新合同 |
| DELETE | `/api/m06/contracts/:id` | 删除合同 |
| POST | `/api/m06/contracts/:id/submit` | **提交审批** |
| POST | `/api/m06/contracts/:id/approve` | **审批通过** |
| GET | `/api/m06/contracts/:contractId/payments` | 回款计划列表 |
| POST | `/api/m06/contracts/:contractId/payments` | 创建回款计划 |
| PUT | `/api/m06/contracts/:contractId/payments/:id` | 更新回款计划 |
| POST | `/api/m06/contracts/:contractId/payments/:id/confirm` | **确认回款** |
| GET | `/api/m06/contracts/:contractId/invoices` | 发票列表 |
| POST | `/api/m06/contracts/:contractId/invoices` | 创建发票 |
| PUT | `/api/m06/contracts/:contractId/invoices/:id` | 更新发票 |

#### M07 - 项目管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m07/projects` | 项目列表 |
| GET | `/api/m07/projects/:id` | 项目详情 |
| POST | `/api/m07/projects` | 创建项目 |
| PUT | `/api/m07/projects/:id` | 更新项目 |
| DELETE | `/api/m07/projects/:id` | 删除项目 |
| GET | `/api/m07/projects/:projectId/milestones` | 里程碑列表 |
| POST | `/api/m07/projects/:projectId/milestones` | 创建里程碑 |
| PUT | `/api/m07/projects/:projectId/milestones/:id` | 更新里程碑 |
| GET | `/api/m07/projects/:projectId/gantt` | 甘特图数据 |
| POST | `/api/m07/projects/:projectId/gantt` | 创建甘特任务 |
| PUT | `/api/m07/projects/:projectId/gantt/:id` | 更新甘特任务 |
| GET | `/api/m07/alerts` | 预警列表 |
| POST | `/api/m07/alerts/:id/resolve` | 解除预警 |

#### M08 - BOM管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m08/boms` | BOM列表 |
| GET | `/api/m08/boms/:id` | BOM详情(含items) |
| POST | `/api/m08/boms` | 创建BOM |
| PUT | `/api/m08/boms/:id` | 更新BOM |
| DELETE | `/api/m08/boms/:id` | 删除BOM |
| GET | `/api/m08/boms/:bomId/versions` | BOM版本列表 |
| POST | `/api/m08/boms/:bomId/versions` | 创建BOM版本 |
| GET | `/api/m08/bom-items/:bomItemId/alternatives` | 替代料列表 |
| POST | `/api/m08/bom-items/:bomItemId/alternatives` | 创建替代料 |
| PUT | `/api/m08/bom-items/:bomItemId/alternatives/:id` | 更新替代料 |
| DELETE | `/api/m08/bom-items/:bomItemId/alternatives/:id` | 删除替代料 |

#### M10 - 生产管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m10/work-orders` | 工单列表 |
| GET | `/api/m10/work-orders/:id` | 工单详情 |
| POST | `/api/m10/work-orders` | 创建工单 |
| PUT | `/api/m10/work-orders/:id` | 更新工单 |
| DELETE | `/api/m10/work-orders/:id` | 删除工单 |
| POST | `/api/m10/work-orders/:id/release` | **下达工单** |
| GET | `/api/m10/work-orders/:workOrderId/process-steps` | 工序列表 |
| GET | `/api/m10/schedule` | 排程列表 |
| PUT | `/api/m10/schedule/:id` | 更新排程 |
| GET | `/api/m10/scan-records` | 报工记录列表 |
| POST | `/api/m10/scan-records` | 创建报工记录 |
| GET | `/api/m10/equipment` | 设备列表 |
| GET | `/api/m10/equipment/:id` | 设备详情 |
| PUT | `/api/m10/equipment/:id` | 更新设备 |
| GET | `/api/m10/quality-checks` | 质检记录列表 |
| POST | `/api/m10/quality-checks` | 创建质检记录 |
| GET | `/api/m10/oee` | OEE数据 |
| GET | `/api/m10/process-routes` | 工艺路线列表 |
| POST | `/api/m10/process-routes` | 创建工艺路线 |
| GET | `/api/m10/work-orders/:workOrderId/material-demands` | 物料需求 |

#### M11 - 库存管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m11/warehouses` | 仓库列表 |
| GET | `/api/m11/warehouses/:id` | 仓库详情 |
| POST | `/api/m11/warehouses` | 创建仓库 |
| PUT | `/api/m11/warehouses/:id` | 更新仓库 |
| DELETE | `/api/m11/warehouses/:id` | 删除仓库 |
| GET | `/api/m11/warehouses/:warehouseId/locations` | 库位列表 |
| POST | `/api/m11/warehouses/:warehouseId/locations` | 创建库位 |
| PUT | `/api/m11/warehouses/:warehouseId/locations/:id` | 更新库位 |
| GET | `/api/m11/batches` | 批次列表 |
| GET | `/api/m11/batches/:id` | 批次详情 |
| POST | `/api/m11/batches` | 创建批次 |
| GET | `/api/m11/inventory` | 库存列表 |
| GET | `/api/m11/pda-operations` | PDA操作记录 |
| POST | `/api/m11/pda-operations` | 创建PDA操作(入库/出库/移库等) |

#### M12 - 成本核算

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/m12/dimensions` | 成本维度列表 |
| GET | `/api/m12/dimensions/:id` | 维度详情 |
| POST | `/api/m12/dimensions` | 创建维度 |
| PUT | `/api/m12/dimensions/:id` | 更新维度 |
| GET | `/api/m12/variances` | 成本差异列表 |
| GET | `/api/m12/alerts` | 成本预警列表 |
| POST | `/api/m12/alerts/:id/resolve` | 解除预警 |
| GET | `/api/m12/projects/:projectId/cost-summary` | 项目成本汇总 |

### 4.3 通用查询参数

所有列表接口支持以下查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | number | 页码，默认1 |
| `pageSize` | number | 每页条数，默认20 |
| `sortBy` | string | 排序字段 |
| `sortOrder` | 'asc'\|'desc' | 排序方向 |
| `keyword` | string | 关键词搜索(模糊匹配name/code等) |
| `status` | string | 状态筛选 |
| `startDate` | string | 日期范围-起始 |
| `endDate` | string | 日期范围-结束 |

---

## 5. 认证方案

### 5.1 JWT认证流程

```
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  Client  │ ──────────────────────────────> │  Server  │
│          │ { username, password }          │          │
│          │                                 │          │
│          │ <────────────────────────────── │          │
│          │ { accessToken, refreshToken }   │          │
└──────────┘                                 └──────────┘

┌──────────┐     GET /api/xxx               ┌──────────┐
│  Client  │ ──────────────────────────────> │  Server  │
│          │ Authorization: Bearer <token>   │          │
│          │                                 │  Guard   │
│          │ <────────────────────────────── │  Verify  │
│          │ { code: 0, data }               │          │
└──────────┘                                 └──────────┘
```

### 5.2 Token策略

| 项目 | accessToken | refreshToken |
|------|-------------|--------------|
| 有效期 | 2小时 | 7天 |
| 存储(前端) | 内存/Zustand | localStorage |
| 用途 | API请求认证 | 刷新accessToken |
| 格式 | JWT | JWT (含tokenId) |

### 5.3 密码安全

- 使用 bcrypt 哈希，saltRounds = 12
- 密码强度要求：8位以上，含大小写+数字+特殊字符
- 登录失败5次锁定账户15分钟

### 5.4 NestJS实现要点

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  
  async validate(payload: JwtPayload): Promise<RequestUser> {
    return { id: payload.sub, username: payload.username, orgId: payload.orgId };
  }
}

// Guards链: JwtAuthGuard -> RolesGuard
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('xxx')
export class XxxController { ... }
```

---

## 6. 与前端的对接方案

### 6.1 MSW替换策略

采用**渐进式替换**，按模块逐步将MSW Handler替换为真实API调用：

```
阶段1: 基础设施 → Auth + M01(系统管理)
阶段2: 核心业务 → M02(客户询价) + M04(产品) + M05(报价)
阶段3: 合同项目 → M06(合同) + M07(项目) + M08(BOM)
阶段4: 生产库存 → M10(生产) + M11(库存)
阶段5: 成本分析 → M12(成本)
```

### 6.2 前端改造要点

1. **移除MSW入口**：注释掉 `src/main.tsx` 中的 `worker.start()`
2. **配置API Base URL**：在Vite配置中设置代理，开发环境代理到后端
3. **统一请求层**：已有axios，需添加拦截器处理token和错误

```typescript
// vite.config.ts 开发代理
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}

// axios拦截器示例
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 尝试刷新token或跳转登录
    }
    return Promise.reject(error);
  }
);
```

### 6.3 前端Store适配

前端Store的接口定义（`src/types/m0x.ts`）与后端Entity基本对齐，主要差异：

| 前端字段 | 后端处理 | 适配方式 |
|----------|----------|----------|
| `id: string` | `UUID`，返回时序列化为string | 无需改动 |
| `audit: AuditFields` | 拆分为 `created_by/created_at/updated_by/updated_at` 独立字段 | 后端序列化时组装为audit对象 |
| `customerName`等冗余字段 | 后端JOIN查询时填充 | 后端Service层处理 |
| `parameterTemplate: ParameterDef[]` | JSONB存储/读取 | TypeORM的`@Column({ type: 'jsonb' })` |
| `parameters: Record<string, string\|number>` | JSONB存储/读取 | TypeORM的`@Column({ type: 'jsonb' })` |

**关键适配：AuditFields序列化**

后端Entity扁平存储审计字段，但在API响应中组装为前端期望的 `audit` 对象：

```typescript
// Entity响应序列化
class CustomerEntity {
  @PrimaryColumn() id: string;
  // ... 业务字段
  @Column() createdBy: string;
  @Column() createdAt: Date;
  @Column() updatedBy: string;
  @Column() updatedAt: Date;
  
  // 序列化为前端格式
  toResponse(): Customer {
    const { createdBy, createdAt, updatedBy, updatedAt, ...rest } = this;
    return { ...rest, audit: { createdBy, createdAt, updatedBy, updatedAt } } as Customer;
  }
}
```

---

## 7. 部署方案

### 7.1 开发环境

使用 `docker-compose.yml` 一键启动：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shelf_erp
      POSTGRES_USER: erp
      POSTGRES_PASSWORD: erp_dev_2025
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
  
  # 后端服务
  backend:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://erp:erp_dev_2025@postgres:5432/shelf_erp
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src

volumes:
  pgdata:
```

### 7.2 生产部署架构

```
                    ┌────────────────┐
                    │   Nginx/CDN    │
                    │  (静态前端)     │
                    └───────┬────────┘
                            │ /api/* 反向代理
                    ┌───────▼────────┐
                    │   Nginx/ALB    │
                    │  (负载均衡)     │
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐
      │  NestJS #1   │ │ NestJS #2  │ │ NestJS #N   │
      │  (容器)      │ │ (容器)     │ │ (容器)      │
      └───────┬──────┘ └───┬────────┘ └──┬──────────┘
              │            │             │
              └─────────────┼─────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──────┐ ┌───▼────────┐ 
      │  PostgreSQL   │ │   Redis    │ 
      │  (RDS/主从)   │ │  (ElastiCache)│ 
      └──────────────┘ └────────────┘ 
```

### 7.3 推荐云平台方案

| 组件 | 方案A: 阿里云 | 方案B: 腾讯云 | 方案C: 自建 |
|------|-------------|-------------|-----------|
| 前端 | OSS + CDN | COS + CDN | Nginx静态 |
| 后端 | ECS/容器服务 | CVM/TCR | Docker |
| 数据库 | RDS PostgreSQL | TDSQL-C | PostgreSQL |
| 缓存 | Redis | TRedis | Redis |
| CI/CD | 云效 | CODING | GitHub Actions |

### 7.4 前端GitHub Pages集成

前端部署在GitHub Pages时，需配置反向代理处理API请求：

**方案一：Nginx反向代理（推荐）**
- 在API服务器上配置Nginx
- 前端API请求指向 `https://api.example.com/api/*`
- 后端CORS配置允许前端域名

**方案二：Vercel/Cloudflare Workers代理**
- 利用边缘函数将 `/api/*` 请求代理到后端
- 适合轻量级场景

**方案三：后端直接托管前端**
- 将前端build产物放入NestJS的static目录
- 简单但不够灵活

---

## 8. 核心业务流程

### 8.1 询价→报价→合同→生产 主流程

```mermaid
sequenceDiagram
    participant C as 客户
    participant S as 销售
    participant E as 工程师
    participant M as 生产

    C->>S: 询价需求
    S->>S: 创建询价单(M02)
    S->>E: 分配工程师
    E->>E: 选择货架类型+配置参数(M04)
    E->>E: BOM计算(calculate-bom)
    E->>S: 提交BOM结果
    S->>S: 创建报价单(M05)<br/>填写成本项+利润率
    S->>C: 发送报价
    C->>S: 确认报价
    S->>S: 创建合同(M06)
    S->>S: 提交合同审批
    Note over S: 合同审批通过
    S->>S: 创建项目(M07)
    S->>M: 下达生产
    M->>M: 创建BOM(M08)
    M->>M: 创建工单(M10)
    M->>M: 物料需求分析
    M->>M: 采购/领料(M11)
    M->>M: 生产执行
```

### 8.2 BOM计算引擎

BOM计算是系统核心算法，基于货架配置参数和规格模板中的公式：

```typescript
// 公式解析器核心逻辑
class FormulaEngine {
  /**
   * 解析公式并计算结果
   * @param formula 如 "layers + 1" 或 "height"
   * @param parameters 如 { length: 2.7, width: 1.0, height: 2.0, layers: 4, loadPerLayer: 500 }
   */
  evaluate(formula: string, parameters: Record<string, number>): number {
    // 1. 替换参数变量为实际值
    // 2. 安全解析数学表达式
    // 3. 返回计算结果
  }
}

// 计算流程
// 1. 根据 shelfConfigId 获取配置参数
// 2. 根据 shelfTypeId 匹配规格 (match-spec)
// 3. 遍历 structureTemplate，对每个节点：
//    - 用公式引擎计算 quantity = evaluate(quantityFormula, parameters)
//    - 用公式引擎计算 length = evaluate(lengthFormula, parameters)
//    - 查材料数据库获取 weight、unitCost
//    - 计算 totalCost = quantity * length * weight * unitCost * (1 + wasteRate)
```

---

## 9. 任务分解

### T01: 项目基础设施

**任务名称**: 项目基础设施搭建  
**包含文件**:
- `package.json`
- `nest-cli.json`
- `tsconfig.json` / `tsconfig.build.json`
- `.eslintrc.js`
- `.env.example`
- `docker-compose.yml`
- `src/main.ts`
- `src/app.module.ts`
- `src/common/` 全部（decorators, filters, guards, interceptors, pipes, dto, entities, utils）
- `src/config/` 全部（database.config.ts, jwt.config.ts, redis.config.ts, config.module.ts）
- `src/database/migrations/` 基础迁移
- `src/database/seeds/seed-runner.ts`

**依赖**: 无  
**优先级**: P0

### T02: 认证 + 系统管理模块

**任务名称**: 认证系统与M01模块实现  
**包含文件**:
- `src/auth/` 全部
- `src/m01/organizations/` 全部
- `src/m01/users/` 全部
- `src/m01/roles/` 全部
- `src/m01/permissions/` 全部
- `src/m01/dictionaries/` 全部
- `src/m01/logs/` 全部
- `src/m01/configs/` 全部
- `src/m01/m01.module.ts`
- `src/database/seeds/m01-seed.ts`

**依赖**: T01  
**优先级**: P0

### T03: 核心业务模块（客户+产品+报价）

**任务名称**: M02+M04+M05核心业务模块实现  
**包含文件**:
- `src/m02/` 全部（customers, contacts, opportunities, inquiries, followups）
- `src/m04/` 全部（shelf-types, shelf-configs, specifications, bom-calculator）
- `src/m05/` 全部（quotations, currencies）
- `src/database/seeds/m02-seed.ts` + `m04-seed.ts` + `m05-seed.ts`

**依赖**: T01  
**优先级**: P0

### T04: 合同+项目+BOM模块

**任务名称**: M06+M07+M08合同项目BOM模块实现  
**包含文件**:
- `src/m06/` 全部（contracts, payments, invoices）
- `src/m07/` 全部（projects, milestones, gantt, alerts）
- `src/m08/` 全部（boms, alternatives）
- `src/database/seeds/m06-seed.ts` + `m07-seed.ts` + `m08-seed.ts`

**依赖**: T03（合同依赖报价、项目依赖客户、BOM依赖产品配置）  
**优先级**: P1

### T05: 生产+库存+成本模块

**任务名称**: M10+M11+M12生产库存成本模块实现  
**包含文件**:
- `src/m10/` 全部（work-orders, process-steps, schedule, scan-records, equipment, quality, oee, process-routes, material-demands）
- `src/m11/` 全部（warehouses, batches, inventory, pda）
- `src/m12/` 全部（dimensions, variances, alerts）
- `src/database/seeds/m10-seed.ts` + `m11-seed.ts` + `m12-seed.ts`

**依赖**: T04（生产依赖BOM/项目、库存依赖仓库+物料、成本依赖项目）  
**优先级**: P1

### 任务依赖图

```mermaid
graph LR
    T01[T01: 项目基础设施] --> T02[T02: 认证+M01]
    T01 --> T03[T03: M02+M04+M05]
    T03 --> T04[T04: M06+M07+M08]
    T04 --> T05[T05: M10+M11+M12]
```

### 所需依赖包

```
- @nestjs/core@^10.0.0: 核心框架
- @nestjs/common@^10.0.0: 公共模块
- @nestjs/platform-express@^10.0.0: Express适配器
- @nestjs/typeorm@^10.0.0: TypeORM集成
- @nestjs/config@^3.0.0: 配置管理
- @nestjs/jwt@^10.0.0: JWT模块
- @nestjs/passport@^10.0.0: Passport集成
- @nestjs/swagger@^7.0.0: Swagger文档
- @nestjs/class-validator@^0.13.0: DTO校验
- @nestjs/class-transformer@^0.5.0: DTO转换
- typeorm@^0.3.0: ORM框架
- pg@^8.11.0: PostgreSQL驱动
- passport@^0.7.0: 认证框架
- passport-jwt@^4.0.0: JWT策略
- passport-local@^1.0.0: 本地策略
- bcrypt@^5.1.0: 密码哈希
- ioredis@^5.3.0: Redis客户端
- winston@^3.11.0: 日志
- mathjs@^12.0.0: 公式解析引擎
- class-validator@^0.14.0: 数据校验
- class-transformer@^0.5.0: 数据转换
- uuid@^9.0.0: UUID生成
- dayjs@^1.11.0: 日期处理
```

---

## 附录A: 环境变量配置

```env
# 应用
NODE_ENV=development
APP_PORT=3000

# 数据库
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shelf_erp
DATABASE_USER=erp
DATABASE_PASSWORD=erp_dev_2025

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=2h
JWT_REFRESH_EXPIRY=7d

# 日志
LOG_LEVEL=debug
```

## 附录B: 编码规范

1. **命名**: 文件名 kebab-case, 类名 PascalCase, 方法/变量 camelCase
2. **Entity**: 使用装饰器定义，JSONB字段用 `@Column({ type: 'jsonb' })`
3. **DTO**: 请求DTO用class-validator装饰器校验，响应DTO与前端type对齐
4. **Service**: 业务逻辑集中在Service层，Controller仅做路由分发
5. **分页**: 统一使用 `PaginationDto`，返回 `PaginatedResponse<T>`
6. **错误**: 使用 NestJS 内置异常类（NotFoundException, BadRequestException等）
7. **审计**: 基类自动填充 `createdBy/updatedBy`，从JWT token中提取用户ID
8. **事务**: 涉及多表写入的操作使用 `@Transaction()` 或 `QueryRunner`
