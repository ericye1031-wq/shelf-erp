# 货架ERP系统 — SRS审计 & 开发完成状态报告

> 生成时间: 2026-06-28  
> SRS版本: V1.0 (2026-06-16)  
> 项目路径: `C:\Users\DELL\Desktop\货架erp 260620`

---

## 一、SRS模块完成度总览

| 编号 | 模块 | SRS优先级 | 后端 | 前端 | 状态 |
|------|------|:--:|:--:|:--:|:--:|
| M01 | 系统管理(MDM+权限) | P0 | ✅ | ✅ | 90权限码 + 8角色映射 |
| M02 | 销售CRM | P0 | ✅ | ✅ | — |
| M03 | 方案设计+图文档 | P1 | ✅ | ✅ | 自动生成 + 审批 + 版本追溯 |
| M04 | 货架配置器 | P0 | ✅ | ✅ | — |
| M05 | 报价引擎 | P0 | ✅ | ✅ | — |
| M06 | 合同管理 | P0 | ✅ | ✅ | — |
| M07 | 项目管理 | P0 | ✅ | ✅ | — |
| M08 | BOM管理 | P0 | ✅ | ✅ | EBOM/MBOM/CBOM转换 + 版本diff + 多级展开 |
| M09 | 采购管理+SRM | P1 | ✅ | ✅ | 评级引擎 + 价格库 + 询比价 |
| M10 | MES生产执行 | P0 | ✅ | ✅ | OEE引擎 + MRP + 14工序种子 |
| M11 | WMS仓储管理 | P0 | ✅ | ✅ | FIFO + 批次 + 五级库位 + 盘点 |
| M12 | 成本核算引擎 | P0 | ✅ | ✅ | — |
| M13 | 财务总账+应收应付 | P1 | ✅ | ✅ | 固定资产 + 报销 + 发票 |
| M14 | 人力资源 | P2 | ✅ | ✅ | 排班 + 计件工资 + 技能矩阵 |
| M15 | 安装管理 | P1 | ✅ | ✅ | PDA报工 + 电子签收 + 成本核算 |
| M16 | 售后管理 | P2 | ✅ | ✅ | 派工引擎 + 满意度 + 备件库存 |
| M17 | BI决策分析 | P2 | ✅ | ✅ | 7大看板API |
| M18 | AI自动报价 | P2 | — | — | 需历史数据积累 |
| M19 | AI智能排产 | P2 | — | — | 需MES设备数据 |
| M20 | AI成本预测 | P2 | — | — | 需钢材行情API |

**SRS完整度: 17/20 (85%) — P0+P1 100%完成**

---

## 二、本地启动指南

### 2.1 快速预览（Mock API模式）
```bash
cd "C:\Users\DELL\Desktop\货架erp 260620"

# 终端1: Mock API服务器
node mock-server.cjs

# 终端2: Vite开发服务器
npx vite --port 5173

# 浏览器打开
http://localhost:5173/shelf-erp/login
# 登录账号: admin / admin123
```

### 2.2 完整后端运行（NestJS + SQLite）
```bash
cd shelf-erp-server

# 安装依赖（如已安装则跳过）
npm install
npm install sql.js

# 构建
npx nest build

# 删除旧数据库（首次运行）
del shelf_erp.sqlite

# 运行种子数据（可选）
npm run seed

# 启动
node dist/main.js

# Swagger文档: http://localhost:3000/api/docs
```

### 2.3 E2E测试
```bash
# 安装浏览器（首次运行）
npx playwright install chromium

# 运行全部35个测试
npx playwright test --timeout 60000 --workers 2
```

---

## 三、关键API端点索引

| 模块 | 端点 | 方法 | 说明 |
|------|------|:--:|------|
| M01 | `/api/m01/auth/login` | POST | 登录 |
| M01 | `/api/m01/auth/register` | POST | 注册 |
| M01 | `/api/m01/permissions/tree` | GET | 权限树 |
| M08 | `/api/m08/boms/:id/convert-to-mbom` | POST | EBOM→MBOM |
| M08 | `/api/m08/boms/:id/convert-to-cbom` | POST | MBOM→CBOM |
| M08 | `/api/m08/boms/:id/compare-versions` | GET | 版本diff |
| M08 | `/api/m08/boms/:id/expand` | GET | 多级展开 |
| M08 | `/api/m08/boms/where-used/:partCode` | GET | 反查影响分析 |
| M09 | `/api/m09/suppliers/:id/rate` | POST | 供应商评级 |
| M09 | `/api/m09/quotes/compare/:requisitionId` | GET | 询比价分析 |
| M10 | `/api/m10/process-routes` | GET | 工艺路线列表 |
| M10 | `/api/m10/oee` | POST | 录入OEE数据 |
| M10 | `/api/m10/oee/trend` | GET | OEE趋势 |
| M10 | `/api/m10/oee/summary` | GET | OEE汇总 |
| M10 | `/api/m10/material-demands/calculate/:woId` | POST | MRP运算 |
| M11 | `/api/m11/inventory/outbound-fifo` | POST | FIFO出库 |
| M11 | `/api/m11/inventory/batches` | GET | 批次查询 |
| M11 | `/api/m11/counts` | POST | 创建盘点 |
| M11 | `/api/m11/counts/:id/reconcile` | POST | 完成盘点 |
| M13 | `/api/m13/fixed-assets/:id/depreciation-schedule` | GET | 折旧表 |
| M13 | `/api/m13/expense-reimbursements/:id/submit` | POST | 提交报销 |
| M14 | `/api/m14/shift-schedules/generate` | GET | 生成排班 |
| M14 | `/api/m14/salary/:id/piece-rate` | GET | 计件工资计算 |
| M14 | `/api/m14/training/skill-matrix` | GET | 技能矩阵 |
| M15 | `/api/m15/reports/pda` | POST | PDA报工 |
| M15 | `/api/m15/reports/daily` | GET | 日报 |
| M15 | `/api/m15/reports/cost/:planId` | GET | 安装成本 |
| M15 | `/api/m15/acceptances/:id/e-signature` | POST | 电子签收 |
| M16 | `/api/m16/service-tickets/stats` | GET | 服务统计 |
| M16 | `/api/m16/service-tickets/auto-dispatch` | GET | 自动派工 |
| M17 | `/api/m17/analytics/ceo-dashboard` | GET | CEO驾驶舱 |
| M17 | `/api/m17/analytics/sales-dashboard` | GET | 销售看板 |
| M17 | `/api/m17/analytics/production-dashboard` | GET | 生产看板 |

---

## 四、技术架构

| 层级 | 技术栈 |
|------|--------|
| 前端 | React 18 + TypeScript + Vite 5 + MUI 5 + Zustand |
| 后端 | NestJS 10 + TypeORM 0.3 |
| 数据库 | SQLite (本地) / PostgreSQL (生产) |
| 缓存 | Redis (生产) |
| 认证 | JWT双Token + RBAC权限 |
| 测试 | Playwright (E2E) + Jest (单元) |

---

## 五、环境注意事项

1. **Node.js**: 当前使用 v26.3.1，packages 已重新编译
2. **sql.js**: 已替代 better-sqlite3（WASM驱动，无需原生编译）
3. **npm镜像**: 已切换至 `registry.npmmirror.com`
4. **Mock API**: 端口 3000，无需数据库即可运行前端
5. **后端端口**: 3000，Swagger文档: `/api/docs`

---

*报告结束*
