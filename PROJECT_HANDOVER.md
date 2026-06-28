# 货架ERP 项目开发进度交接文档

> 更新时间: 2026-06-18 08:34
> 更新人: WorkBuddy AI 助理
> 面向: 后续接手开发的同事

---

## 一、项目概览

| 项目 | 说明 |
|------|------|
| 仓库名称 | shelf-erp |
| 仓库地址 | https://github.com/ericye1031-wq/shelf-erp.git |
| 在线Demo | https://ericye1031-wq.github.io/shelf-erp/ |
| 演示账号 | admin / admin123 |
| 项目定位 | 货架制造业 ERP 系统，核心是**货架报价系统** |
| 行业 | 货架制造业（轻型/中型/重型/阁楼式/悬臂式等） |

---

## 二、技术栈

### 前端（已完成）
- React 18 + TypeScript + Vite 5
- MUI 5 + Tailwind CSS
- Zustand（状态管理，10个业务Store + 1个认证Store）
- MSW（Mock Service Worker，模拟后端数据）
- GitHub Pages 自动部署（push main 自动触发）
- recharts（Dashboard 图表）

### 后端（框架已完成，待集成测试）
- NestJS 10 + TypeORM 0.3 + TypeScript 5.7
- PostgreSQL 16 + Redis 7
- Passport + JWT（双Token认证）
- mathjs（公式解析，BOM计算引擎基础）
- Docker Compose（本地开发环境）
- Swagger API 文档（/api/docs）
- winston（日志）

---

## 三、整体进度总览

| 阶段 | 任务 | 状态 | 说明 |
|------|------|------|------|
| **前端** | 10个业务模块页面 | ✅ 已完成 | M01~M12 共50+页面 |
| **前端** | 修复tsc类型错误 | ✅ 已完成 | 前端 0 errors |
| **前端** | CI/CD流水线 | ✅ 已完成 | GitHub Actions 自动部署 |
| **后端** | 架构设计 | ✅ 已完成 | docs/backend-architecture.md（1955行） |
| **后端** | T01 项目基础设施 | ✅ 已完成 | 30个文件，NestJS+TypeORM+PG+Redis |
| **后端** | T02 认证+M01系统管理 | ✅ 已完成 | JWT双Token+用户/角色/组织CRUD |
| **后端** | T03 M02客户询价 | ✅ 已完成 | 客户/联系人/商机/询价/跟进 5个子模块 |
| **后端** | T03 M04产品管理 | ✅ 已完成 | 货架类型/配置/规格/BOM计算引擎 |
| **后端** | T03 M05报价管理 | ✅ 已完成 | 报价单+成本项+版本对比+币种 |
| **后端** | T04 M06+M07+M08 | ✅ 已完成 | 合同/项目/采购 |
| **后端** | T05 M10+M11+M12 | ✅ 已完成 | 生产/仓储/成本 |
| **后端** | tsc编译检查 | ✅ 已完成 | 后端 0 errors |
| **后端** | 跨模块业务逻辑 | 🔄 进行中 | M06/M07/M08/M10已补充，待事件驱动实现 |
| **数据** | 基础数据准备Excel | 📝 用户填写中 | 桌面已放Excel清单 |
| **集成** | 端到端集成测试 | ❌ 未开始 | 询价→报价→合同核心链路 |
| **集成** | 前端对接真实API | ❌ 未开始 | 渐进式替换MSW |
| **环境** | Docker数据库 | ❌ 未安装 | 需安装Docker Desktop |

---

## 四、项目结构

```
货架ERP/
├── .github/workflows/deploy-pages.yml   # CI/CD
├── docs/                                 # 架构文档
│   ├── backend-architecture.md           # 后端架构设计（1955行）
│   ├── sequence-diagram.mermaid          # 核心业务时序图
│   └── class-diagram.mermaid             # 实体类图
├── src/                                  # 前端源码（144个TS/TSX文件）
│   ├── types/          # TypeScript类型定义
│   ├── stores/         # Zustand状态管理（10个模块Store）
│   ├── mock/           # MSW模拟数据
│   ├── pages/          # 页面组件（10个模块，50+页面）
│   ├── components/     # 通用组件
│   ├── layouts/        # 布局
│   ├── hooks/          # 自定义Hooks
│   ├── services/       # API服务
│   └── utils/          # 工具函数
├── shelf-erp-server/                     # 后端源码（145个TS文件）
│   ├── src/
│   │   ├── main.ts               # 启动入口
│   │   ├── app.module.ts         # 根模块（已注册全部10个模块）
│   │   ├── common/               # 公共模块（14个文件）
│   │   ├── config/               # 配置（4个文件）
│   │   ├── auth/                 # 认证（5个文件）
│   │   ├── database/seeds/       # 种子数据（2个文件）
│   │   ├── m01/                  # 系统管理（19个文件）
│   │   ├── m02/                  # 客户询价（22个文件）
│   │   ├── m04/                  # 产品管理（20个文件）
│   │   ├── m05/                  # 报价管理（13个文件）
│   │   ├── m06/                  # 合同管理（8个文件）
│   │   ├── m07/                  # 项目管理（8个文件）
│   │   ├── m08/                  # 采购管理（7个文件）
│   │   ├── m10/                  # 生产管理（7个文件）
│   │   ├── m11/                  # 仓储管理（7个文件）
│   │   └── m12/                  # 成本核算（7个文件）
│   ├── docker-compose.yml        # PostgreSQL 16 + Redis 7
│   └── .env.example              # 环境变量模板
└── PROJECT_HANDOVER.md           # 本文档
```

---

## 五、后端模块详情

### 5.1 M01 系统管理（19个文件）

| 子模块 | 实体 | 功能 | API |
|--------|------|------|-----|
| users | User | 用户CRUD + 修改密码 | /api/m01/users |
| roles | Role + RoleRelation | 角色CRUD + 权限关联 | /api/m01/roles |
| organizations | Organization | 组织CRUD + 树形查询 | /api/m01/organizations |
| permissions | Permission | 权限树 + 种子数据 | — |

### 5.2 M02 客户询价（22个文件）

| 子模块 | 实体 | 功能 | API |
|--------|------|------|-----|
| customers | Customer + Contact | 客户CRUD + 联系人 | /api/m02/customers |
| opportunities | Opportunity | 商机CRUD + 阶段管理 | /api/m02/opportunities |
| inquiries | Inquiry | 询价CRUD | /api/m02/inquiries |
| followups | FollowUp | 跟进记录CRUD | /api/m02/followups |

### 5.3 M04 产品管理（20个文件）

| 子模块 | 实体 | 功能 | API |
|--------|------|------|-----|
| shelf-types | ShelfType | 货架类型库CRUD + 参数模板 | /api/m04/shelf-types |
| shelf-configs | ShelfConfig | 货架配置CRUD + BOM计算 + 规格匹配 | /api/m04/configs |
| specifications | Specification | 规格匹配CRUD | /api/m04/specifications |
| bom-calculator | BomItem | **BOM计算引擎**（核心） | 内部服务 |

**BOM计算引擎核心逻辑**：
1. 根据 shelfConfigId 获取配置参数
2. 匹配对应规格（Specification）
3. 遍历 structureTemplate，使用公式引擎（mathjs）计算每个节点
4. 公式：`数量 * 长度 * 单位重量 * 单价 * (1 + 损耗率)`
5. 自动推断零件分类（立柱/横梁/层板/加强件/紧固件/背板）
6. 支持递归子节点计算
7. 结果持久化到 bom_items 表

### 5.4 M05 报价管理（13个文件）

| 子模块 | 实体 | 功能 | API |
|--------|------|------|-----|
| quotations | Quotation + CostItem + QuotationVersion | 报价单CRUD + 状态流转 + 版本对比 + 成本项 | /api/m05/quotations |
| currencies | Currency | 币种管理 + 汇率 | /api/m05/currencies |

**报价单状态流转**：draft → pending_review → approved → sent → accepted/rejected

**特殊端点**：
- POST `/api/m05/quotations/:id/submit` — 提交审批
- POST `/api/m05/quotations/:id/approve` — 审批通过
- POST `/api/m05/quotations/:id/send` — 发送客户
- POST `/api/m05/quotations/:id/respond` — 客户响应
- GET `/api/m05/quotations/:id/versions` — 版本列表
- GET `/api/m05/quotations/compare?v1=&v2=` — 版本对比
- GET/POST/PUT/DELETE `/api/m05/quotations/:id/cost-items` — 成本项

### 5.5 M06 合同管理（8个文件）

| 实体 | 功能 | API |
|------|------|-----|
| Contract | 合同CRUD + 状态流转 | /api/m06/contracts |
| PaymentPlan | 回款计划 | /api/m06/contracts/:id/payment-plans |
| Invoice | 发票管理 | /api/m06/contracts/:id/invoices |

**合同状态流转**：draft → reviewing → approved → executing → completed/terminated

### 5.6 M07 项目管理（8个文件）

| 实体 | 功能 | API |
|------|------|-----|
| Project | 项目CRUD + 状态流转 | /api/m07/projects |
| Milestone | 里程碑管理 | /api/m07/projects/:id/milestones |
| Alert | 预警管理 | /api/m07/projects/:id/alerts |

**项目状态流转**：planning → in_progress → paused → completed/cancelled

### 5.7 M08 采购管理（7个文件）

| 实体 | 功能 | API |
|------|------|-----|
| PurchaseOrder | 采购单CRUD + 状态流转 | /api/m08/purchases |
| PurchaseItem | 采购明细 + 自动计算总金额 | /api/m08/purchases/:id/items |

**采购状态流转**：draft → submitted → approved → ordered → partial_received → received → cancelled

### 5.8 M10 生产管理（7个文件）

| 实体 | 功能 | API |
|------|------|-----|
| WorkOrder | 工单CRUD + 状态流转 | /api/m10/work-orders |
| ProcessStep | 工序管理 + 状态变更自动记录 | /api/m10/work-orders/:id/process-steps |

**工单状态流转**：pending → released → in_progress → completed → closed

### 5.9 M11 仓储管理（7个文件）

| 实体 | 功能 | API |
|------|------|-----|
| Warehouse | 仓库CRUD | /api/m11/warehouses |
| Inventory | 库存管理 + 低库存预警 | /api/m11/inventory |
| InventoryTransaction | 库存事务记录 | 内部实体 |

**特殊端点**：
- POST `/api/m11/inventory/inbound` — 入库
- POST `/api/m11/inventory/outbound` — 出库
- GET `/api/m11/inventory/low-stock` — 低库存预警

### 5.10 M12 成本核算（7个文件）

| 实体 | 功能 | API |
|------|------|-----|
| CostDimension | 成本维度CRUD + 自动计算差异率 | /api/m12/dimensions |
| CostAlert | 超预算自动预警 | /api/m12/alerts |

**特殊端点**：
- GET `/api/m12/projects/:id/summary` — 项目成本汇总

---

## 六、后端完整API端点清单

### 认证 (/api/m01/auth)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/m01/auth/login | 登录（返回accessToken+refreshToken+user） |
| POST | /api/m01/auth/register | 注册 |
| POST | /api/m01/auth/refresh | 刷新Token |
| GET | /api/m01/auth/me | 当前用户信息 |

### M01 系统管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m01/users | 用户列表/创建 |
| GET/PUT/DELETE | /api/m01/users/:id | 用户详情/更新/删除 |
| PUT | /api/m01/users/:id/password | 修改密码 |
| GET/POST | /api/m01/roles | 角色列表/创建 |
| GET/PUT/DELETE | /api/m01/roles/:id | 角色详情/更新/删除 |
| GET | /api/m01/roles/:id/permissions | 角色权限 |
| GET/POST | /api/m01/organizations | 组织列表/创建 |
| GET | /api/m01/organizations/tree | 组织树 |
| GET/PUT/DELETE | /api/m01/organizations/:id | 组织详情/更新/删除 |

### M02 客户询价
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m02/customers | 客户列表/创建 |
| GET/PUT/DELETE | /api/m02/customers/:id | 客户详情/更新/删除 |
| GET/POST | /api/m02/opportunities | 商机列表/创建 |
| GET/PUT/DELETE | /api/m02/opportunities/:id | 商机详情/更新/删除 |
| GET/POST | /api/m02/inquiries | 询价列表/创建 |
| GET/PUT/DELETE | /api/m02/inquiries/:id | 询价详情/更新/删除 |
| GET/POST | /api/m02/followups | 跟进记录列表/创建 |
| GET/PUT/DELETE | /api/m02/followups/:id | 跟进详情/更新/删除 |

### M04 产品管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m04/shelf-types | 货架类型列表/创建 |
| GET/PUT/DELETE | /api/m04/shelf-types/:id | 货架类型详情/更新/删除 |
| GET/POST | /api/m04/configs | 配置列表/创建 |
| POST | /api/m04/configs/:id/calculate-bom | 计算BOM |
| POST | /api/m04/configs/:id/match-spec | 匹配规格 |
| GET/POST | /api/m04/specifications | 规格列表/创建 |
| GET/PUT/DELETE | /api/m04/specifications/:id | 规格详情/更新/删除 |

### M05 报价管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m05/quotations | 报价单列表/创建 |
| GET/PUT/DELETE | /api/m05/quotations/:id | 报价单详情/更新/删除 |
| POST | /api/m05/quotations/:id/submit | 提交审批 |
| POST | /api/m05/quotations/:id/approve | 审批通过 |
| POST | /api/m05/quotations/:id/send | 发送客户 |
| POST | /api/m05/quotations/:id/respond | 客户响应 |
| GET | /api/m05/quotations/:id/versions | 版本列表 |
| GET | /api/m05/quotations/compare | 版本对比(?v1=&v2=) |
| CRUD | /api/m05/quotations/:id/cost-items | 成本项管理 |
| GET/POST | /api/m05/currencies | 币种列表/创建 |

### M06 合同管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m06/contracts | 合同列表/创建 |
| GET/PUT/DELETE | /api/m06/contracts/:id | 合同详情/更新/删除 |
| POST | /api/m06/contracts/:id/status | 变更状态 |
| CRUD | /api/m06/contracts/:id/payment-plans | 回款计划 |
| CRUD | /api/m06/contracts/:id/invoices | 发票管理 |

### M07 项目管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m07/projects | 项目列表/创建 |
| GET/PUT/DELETE | /api/m07/projects/:id | 项目详情/更新/删除 |
| POST | /api/m07/projects/:id/status | 变更状态 |
| CRUD | /api/m07/projects/:id/milestones | 里程碑 |
| CRUD | /api/m07/projects/:id/alerts | 预警 |

### M08 采购管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m08/purchases | 采购单列表/创建 |
| GET/PUT/DELETE | /api/m08/purchases/:id | 采购单详情/更新/删除 |
| POST | /api/m08/purchases/:id/status | 变更状态 |
| CRUD | /api/m08/purchases/:id/items | 采购明细 |

### M10 生产管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m10/work-orders | 工单列表/创建 |
| GET/PUT/DELETE | /api/m10/work-orders/:id | 工单详情/更新/删除 |
| POST | /api/m10/work-orders/:id/status | 变更状态 |
| CRUD | /api/m10/work-orders/:id/process-steps | 工序管理 |

### M11 仓储管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m11/warehouses | 仓库列表/创建 |
| GET/PUT/DELETE | /api/m11/warehouses/:id | 仓库详情/更新/删除 |
| GET/POST | /api/m11/inventory | 库存列表/创建 |
| POST | /api/m11/inventory/inbound | 入库 |
| POST | /api/m11/inventory/outbound | 出库 |
| GET | /api/m11/inventory/low-stock | 低库存预警 |

### M12 成本核算
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | /api/m12/dimensions | 成本维度列表/创建 |
| GET/PUT/DELETE | /api/m12/dimensions/:id | 成本维度详情/更新/删除 |
| GET | /api/m12/projects/:id/summary | 项目成本汇总 |
| GET | /api/m12/alerts | 成本预警列表 |

---

## 七、数据库设计概要

### 公共字段
- **BaseEntity**: id(UUID), created_by, created_at, updated_by, updated_at
- **SoftDeleteEntity**: 继承BaseEntity + is_deleted, deleted_at, deleted_by
- **JSONB字段**: parameterTemplate, parameters, structureTemplate, processRouteSteps

### 核心表

| 模块 | 核心表 | 说明 |
|------|--------|------|
| Auth | — | JWT双Token，无持久化Token表 |
| M01 | users, roles, permissions, organizations, user_roles, role_permissions | 系统管理+认证 |
| M02 | customers, contacts, opportunities, inquiries, inquiry_items, follow_ups | 客户+询价 |
| M04 | shelf_types, shelf_type_parameters, specifications, structure_nodes, shelf_configs, shelf_config_items, bom_items | 产品+BOM |
| M05 | quotations, cost_items, quotation_versions, currencies | 报价+币种 |
| M06 | contracts, payment_plans, invoices | 合同+回款+发票 |
| M07 | projects, milestones, alerts | 项目+里程碑+预警 |
| M08 | purchase_orders, purchase_items | 采购+明细 |
| M10 | work_orders, process_steps | 工单+工序 |
| M11 | warehouses, inventories, inventory_transactions | 仓库+库存+事务 |
| M12 | cost_dimensions, cost_alerts | 成本维度+预警 |

---

## 八、编译验证

| 检查项 | 结果 |
|--------|------|
| 前端 `tsc --noEmit` | ✅ 0 errors |
| 前端 `vite build` | ✅ 通过 |
| 后端 `tsc --noEmit` | ✅ 0 errors |
| 全部10个模块注册到AppModule | ✅ |

---

## 九、当前代码提交状态

**已提交（最近10次）**：
```
7fb6807 docs: 添加项目交接文档 PROJECT_HANDOVER.md
233d99e feat: 完善InquiryForm询价表单
54784c5 feat: 5项前端细节优化
e028487 fix: Store fetch错误处理+useBreadcrumb修复+演示登录+MSW恢复
07f8b71 fix: demo login button type=button
716ef87 feat: add demo login button
7cb4e7f fix: add BrowserRouter basename
f920fa6 fix: 补全5个遗留缺口
6543963 feat: complete all 10 ERP modules
74f07cb fix: remove npm cache config
```

**未提交（82个前端文件 + 全部后端文件）**：
- 前端：79个modified + 3个untracked（tsc修复 + CI/CD优化 + MUI图标类型声明）
- 后端：整个 `shelf-erp-server/` 目录（145个TS文件，全部新增）
- 文档：`docs/` 目录（架构文档 + Mermaid图）

> ⚠️ **后端代码和前端修复尚未提交到Git**，需要 `git add . && git commit` 后推送。

---

## 十、下一步开发任务（按优先级）

### P0 - 立即需要做

| # | 任务 | 具体工作 | 说明 |
|---|------|---------|------|
| 1 | **提交全部代码** | git add + commit + push | 后端145个文件+前端82个文件待提交 |
| 2 | **配置前端开发代理** | vite.config.ts 添加 proxy 到后端3000端口 | 前后端联调前置条件 |
| 3 | **Docker启动数据库** | docker-compose up -d | PostgreSQL 16 + Redis 7 |
| 4 | **运行种子数据** | npm run seed | 创建admin用户+8角色+权限树+组织架构 |

### P1 - 本周内完成

| # | 任务 | 具体工作 |
|---|------|---------|
| 5 | **跑通核心链路** | 询价→BOM计算→报价→合同，端到端集成测试 |
| 6 | **前端对接真实API** | 渐进式替换MSW，从M01认证开始 |
| 7 | **Docker安装** | 安装Docker Desktop，启动PostgreSQL+Redis | 本地开发前置条件 |
| 8 | **完善事件驱动** | 实现跨模块事件通信（合同→项目→工单→库存→成本） | 核心业务链路 |

### P2 - 后续迭代

| # | 任务 |
|---|------|
| 9 | 自动化测试（E2E + 单元） |
| 10 | 生产部署方案 |
| 11 | 成本核算精细化（与采购/生产数据联动） |
| 12 | PWA / 性能优化 |
| 13 | WebSocket实时通知（预警/审批） |
| 14 | 文件上传（合同附件/发票PDF） |

---

## 十一、关键文件速查

| 用途 | 路径 |
|------|------|
| 后端架构设计 | `docs/backend-architecture.md` |
| 核心业务时序图 | `docs/sequence-diagram.mermaid` |
| 实体类图 | `docs/class-diagram.mermaid` |
| 前端CI/CD | `.github/workflows/deploy-pages.yml` |
| 后端入口 | `shelf-erp-server/src/main.ts` |
| 后端根模块 | `shelf-erp-server/src/app.module.ts`（已注册M01~M12全部模块） |
| 认证模块 | `shelf-erp-server/src/auth/` |
| BOM计算引擎 | `shelf-erp-server/src/m04/bom-calculator/bom-calculator.service.ts` |
| 公式解析器 | `shelf-erp-server/src/common/utils/formula-parser.util.ts` |
| 单号生成器 | `shelf-erp-server/src/common/utils/code-generator.util.ts` |
| 公共实体基类 | `shelf-erp-server/src/common/entities/` |
| 公共DTO | `shelf-erp-server/src/common/dto/` |
| 公共守卫 | `shelf-erp-server/src/common/guards/` |
| 公共拦截器 | `shelf-erp-server/src/common/interceptors/` |
| 种子数据 | `shelf-erp-server/src/database/seeds/m01-seed.ts` |
| Docker配置 | `shelf-erp-server/docker-compose.yml` |
| 环境变量模板 | `shelf-erp-server/.env.example` |
| 基础数据Excel | 桌面/货架ERP基础数据准备清单.xlsx |

---

## 十二、本地启动指南

### 前端
```bash
cd 货架ERP
npm install
npm run dev          # 开发服务器 http://localhost:5173
npm run build        # Vite构建
npm run build:check  # tsc + Vite构建（类型检查）
```

### 后端
```bash
# 1. 启动数据库（Docker）
cd shelf-erp-server
docker-compose up -d    # PostgreSQL 16 + Redis 7

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入数据库连接信息

# 3. 安装依赖 & 启动
npm install
npm run start:dev       # 开发模式 http://localhost:3000

# 4. 种子数据（首次启动）
npm run seed
# 默认管理员: admin / admin123

# 5. 类型检查
npx tsc --noEmit        # 验证0错误
```

### Swagger API 文档
后端启动后访问: http://localhost:3000/api/docs

---

## 十三、种子数据

### 默认组织架构
- 货架集团（根）
  - 销售部 / 技术部 / 生产部 / 采购部 / 仓库 / 财务部

### 默认角色（8个）
admin, manager, sales, engineer, warehouse, finance, production, quality

### 默认用户
- 用户名: admin / 密码: admin123 / 角色: admin（超级管理员）

### 权限树（9大模块）
系统管理、客户询价、产品管理、报价、合同、项目、生产、库存、成本

---

## 十四、注意事项

1. **BOM计算引擎是核心**：位于 `m04/bom-calculator/bom-calculator.service.ts`，是报价系统最关键的组件，基于mathjs公式解析
2. **前端MSW仍在运行**：当前前端数据全由MSW模拟，后端API就绪后需要渐进式替换
3. **API路径已对齐**：后端使用 `/api/m0x/xxx` 路径，与前端MSW handler完全兼容，对接时前端零改动
4. **Vite开发代理未配置**：需要在前端 vite.config.ts 中添加 `server.proxy` 到后端3000端口
5. **PostgreSQL依赖uuid-ossp**：需要执行 `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
6. **后端代码尚未提交Git**：整个 `shelf-erp-server/` 目录和82个前端文件待提交
7. **M06~M12的Service**：当前实现了完整CRUD + 状态流转，但跨模块关联查询（如报价→合同→项目链路）需后续完善
8. **公共实体BaseEntity**：所有业务实体继承BaseEntity，包含id(UUID)、createdBy、createdAt、updatedBy、updatedAt
9. **单号生成器**：`code-generator.util.ts` 需3个参数 `(module, sequence, date)`，各Service中已正确调用
10. **分页标准**：所有列表查询使用 `PaginationDto`，返回 `createPaginatedResponse` 格式

---

> 📞 有问题请联系 QINC（南京，货架制造业）
