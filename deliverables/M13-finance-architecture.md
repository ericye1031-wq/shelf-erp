# M13 财务总账+应收应付模块 系统架构设计

> 版本: v1.0
> 日期: 2026-06-21
> 作者: 高见远（Gao），架构师
> 模块编号: M13
> 技术栈: 后端 NestJS + TypeORM + SQLite (better-sqlite3) | 前端 React + MUI + Zustand
> 依据: M13-finance-prd.md

---

## 一、实现方案 + 框架选型

### 1.1 后端模块划分（NestJS）

遵循现有 M08/M09 的分层模式：每个子模块独立 entity / service / controller / module / dto，由 `m13.module.ts` 聚合。

```
shelf-erp-server/src/m13/
├── m13.module.ts                     # 聚合模块，导入所有子模块
├── accounts/                         # 科目管理（P0）
│   ├── account.entity.ts             # Account 科目实体（树形自引用）
│   ├── account.service.ts            # 科目 CRUD + 树形查询 + 模板导入
│   ├── account.controller.ts         # REST 接口
│   ├── account.module.ts
│   └── dto/
│       └── account.dto.ts            # CreateAccountDto / UpdateAccountDto
├── vouchers/                         # 凭证管理（P0）
│   ├── voucher.entity.ts             # Voucher 凭证主表
│   ├── voucher-entry.entity.ts       # VoucherEntry 凭证明细行
│   ├── voucher.service.ts            # 凭证录入/审核/过账/红字冲销 + 借贷平衡校验
│   ├── voucher.controller.ts
│   ├── voucher.module.ts
│   └── dto/
│       └── voucher.dto.ts            # CreateVoucherDto / VoucherEntryDto / AuditDto / PostDto
├── receivables/                      # 应收管理（P0）
│   ├── receivable.entity.ts          # AccountsReceivable 应收单
│   ├── receipt.entity.ts             # Receipt 收款记录 + ReceiptSettlement 核销明细
│   ├── receivable.service.ts         # 立账 / 收款核销 / 账龄计算
│   ├── receivable.controller.ts
│   ├── receivable.module.ts
│   └── dto/
│       └── receivable.dto.ts         # CreateReceivableDto / ReceiptDto
├── payables/                         # 应付管理（P0）
│   ├── payable.entity.ts             # AccountsPayable 应付单
│   ├── payment-request.entity.ts     # PaymentRequest 付款申请 + PaymentApproval 审批节点
│   ├── payment.entity.ts             # Payment 实际付款记录
│   ├── payable.service.ts            # 立账 / 付款申请 / 审批 / 付款核销
│   ├── payable.controller.ts
│   ├── payable.module.ts
│   └── dto/
│       └── payable.dto.ts            # CreatePayableDto / PaymentRequestDto / ApproveDto
├── bank-accounts/                    # 银行账户（P0）
│   ├── bank-account.entity.ts        # BankAccount 银行账户
│   ├── bank-transaction.entity.ts    # BankTransaction 银行流水
│   ├── bank-account.service.ts       # 账户 CRUD / 流水录入 / 余额更新
│   ├── bank-account.controller.ts
│   ├── bank-account.module.ts
│   └── dto/
│       └── bank-account.dto.ts       # CreateBankAccountDto / TransactionDto
├── fund-reports/                     # 资金报表（P0）
│   ├── fund-report.service.ts        # 资金日报生成 / 账龄分析（P1）/ 试算平衡表
│   ├── fund-report.controller.ts
│   ├── fund-report.module.ts
│   └── dto/
│       └── fund-report.dto.ts        # FundDailyQueryDto / AgingQueryDto
├── month-close/                      # 月结管理（P1）
│   ├── month-close.entity.ts         # MonthClose 月结记录
│   ├── month-close.service.ts        # 月结检查 / 损益结转 / 锁定/反月结
│   ├── month-close.controller.ts
│   ├── month-close.module.ts
│   └── dto/
│       └── month-close.dto.ts        # MonthCloseDto
└── expenses/                         # 费用报销（P1）
    ├── expense.entity.ts             # ExpenseReimbursement 报销单 + ExpenseItem 报销明细
    ├── expense.service.ts            # 报销全流程：申请→审批→付款→生成凭证
    ├── expense.controller.ts
    ├── expense.module.ts
    └── dto/
        └── expense.dto.ts            # CreateExpenseDto / ApproveDto
```

**模块依赖关系**（后端 Service 注入）：

```
VoucherService → AccountService（科目校验）
ReceivableService → VoucherService（收款生成凭证）+ BankAccountService（余额更新）
PayableService → VoucherService（付款生成凭证）+ BankAccountService（余额更新）
ExpenseService → PayableService（报销付款走付款申请）+ VoucherService（报销凭证）
FundReportService → BankAccountService + VoucherService + ReceivableService + PayableService
MonthCloseService → VoucherService（凭证锁定/损益结转）
```

因此 `m13.module.ts` 需将 AccountService、VoucherService、BankAccountService 等 export 供跨子模块注入。

### 1.2 前端页面划分（React + MUI）

```
src/
├── types/
│   └── m13.ts                        # M13 全部 TypeScript 类型定义
├── services/
│   └── m13.ts                        # M13 全部 API 调用函数
├── stores/
│   └── useM13Store.ts                # Zustand store（科目树/凭证列表/应收/应付/银行账户/报表状态）
├── pages/m13/
│   ├── AccountListPage.tsx           # 科目管理（树形表格 + FormDrawer）
│   ├── VoucherListPage.tsx           # 凭证列表（状态筛选 + 批量过账）
│   ├── VoucherEntryPage.tsx          # 凭证录入（分录编辑表格 + 借贷平衡校验）
│   ├── VoucherDetailPage.tsx         # 凭证详情（只读 + 红字冲销）
│   ├── ReceivableListPage.tsx        # 应收管理（统计卡片 + 收款核销抽屉）
│   ├── PayableListPage.tsx           # 应付管理（统计卡片 + 付款申请抽屉）
│   ├── PaymentApprovalPage.tsx       # 付款审批（审批弹窗）
│   ├── BankAccountPage.tsx           # 银行账户（卡片布局 + 流水查看）
│   ├── FundDailyReportPage.tsx       # 资金日报（汇总卡片 + 明细表格 + 导出）
│   ├── AgingAnalysisPage.tsx         # 账龄分析（P1，应收/应付 Tab 切换）
│   ├── MonthClosePage.tsx            # 月结管理（P1，检查清单 + 试算平衡表）
│   └── ExpenseReimbursementPage.tsx  # 费用报销（P1，报销列表 + 审批流）
└── router/index.tsx                  # 新增 M13 路由注册块
```

**页面与 Store 的数据流**：页面组件 → `useM13Store` action → `services/m13.ts` API → 后端 Controller → Service → Repository。与 M12 模式一致。

### 1.3 数据库：SQLite 适配说明

| 项目 | PostgreSQL（SRS 原设计） | SQLite（当前项目） | 适配说明 |
|------|--------------------------|---------------------|----------|
| 驱动 | `pg` | `better-sqlite3` | 已在 `database.config.ts` 中通过 `DB_TYPE` 切换 |
| 金额字段 | `decimal(14,2)` / `numeric` | SQLite 无原生 DECIMAL，存为 `REAL`（浮点） | **关键适配**：Entity 中仍声明 `type: 'decimal'`，TypeORM 在 SQLite 下自动映射为 `REAL`。为避免浮点精度问题，**所有金额运算在后端用 `mathjs`（已安装）做 Decimal 运算**，不以 SQL 聚合为准。借贷平衡校验在 Service 层用 `mathjs.equal(debitSum, creditSum)` 判断 |
| 日期字段 | `date` / `timestamptz` | `datetime` / `text` | TypeORM 自动处理，`@CreateDateColumn({ type: 'datetime' })` 已是现有约定 |
| UUID | `uuid` 类型 + `gen_random_uuid()` | `text` 存储，应用层 `uuidv4()` | 现有约定：`@PrimaryColumn('uuid')` + `id: string = uuidv4()`，SQLite 下自动存为 text |
| 事务 | `SERIALIZABLE` | `BEGIN/COMMIT`，单写者锁 | TypeORM `queryRunner` 事务在 SQLite 下正常工作，但**不支持并发写**。财务过账等关键操作需在 Service 层加事务 + 乐观锁（version 字段） |
| JSON 字段 | `jsonb` | `text` 存 JSON 字符串 | 辅助核算项用 `text` 存 JSON，应用层序列化/反序列化 |
| 外键约束 | 原生支持 | 默认关闭，需 `PRAGMA foreign_keys = ON` | TypeORM `synchronize` 自动建表，关系通过应用层维护，不依赖 FK 约束 |
| 索引 | 支持表达式索引 | 支持普通索引 | 关键查询字段（voucher_no, customer_id, status, voucher_date）加 `@Index` |

**SQLite 并发策略**：better-sqlite3 是同步驱动，单进程内天然串行。财务模块数据量小（单公司、月均百级凭证），SQLite 完全满足。生产部署需确保单实例运行，不跨进程并发写。

---

## 二、文件列表及相对路径

### 2.1 后端文件

| # | 文件路径 | 说明 | 优先级 |
|---|----------|------|--------|
| 1 | `shelf-erp-server/src/m13/m13.module.ts` | 聚合模块 | P0 |
| 2 | `shelf-erp-server/src/m13/accounts/account.entity.ts` | 科目实体 | P0 |
| 3 | `shelf-erp-server/src/m13/accounts/account.service.ts` | 科目服务 | P0 |
| 4 | `shelf-erp-server/src/m13/accounts/account.controller.ts` | 科目接口 | P0 |
| 5 | `shelf-erp-server/src/m13/accounts/account.module.ts` | 科目模块 | P0 |
| 6 | `shelf-erp-server/src/m13/accounts/dto/account.dto.ts` | 科目 DTO | P0 |
| 7 | `shelf-erp-server/src/m13/vouchers/voucher.entity.ts` | 凭证主实体 | P0 |
| 8 | `shelf-erp-server/src/m13/vouchers/voucher-entry.entity.ts` | 凭证明细实体 | P0 |
| 9 | `shelf-erp-server/src/m13/vouchers/voucher.service.ts` | 凭证服务 | P0 |
| 10 | `shelf-erp-server/src/m13/vouchers/voucher.controller.ts` | 凭证接口 | P0 |
| 11 | `shelf-erp-server/src/m13/vouchers/voucher.module.ts` | 凭证模块 | P0 |
| 12 | `shelf-erp-server/src/m13/vouchers/dto/voucher.dto.ts` | 凭证 DTO | P0 |
| 13 | `shelf-erp-server/src/m13/receivables/receivable.entity.ts` | 应收单实体 | P0 |
| 14 | `shelf-erp-server/src/m13/receivables/receipt.entity.ts` | 收款记录实体 | P0 |
| 15 | `shelf-erp-server/src/m13/receivables/receivable.service.ts` | 应收服务 | P0 |
| 16 | `shelf-erp-server/src/m13/receivables/receivable.controller.ts` | 应收接口 | P0 |
| 17 | `shelf-erp-server/src/m13/receivables/receivable.module.ts` | 应收模块 | P0 |
| 18 | `shelf-erp-server/src/m13/receivables/dto/receivable.dto.ts` | 应收 DTO | P0 |
| 19 | `shelf-erp-server/src/m13/payables/payable.entity.ts` | 应付单实体 | P0 |
| 20 | `shelf-erp-server/src/m13/payables/payment-request.entity.ts` | 付款申请实体 | P0 |
| 21 | `shelf-erp-server/src/m13/payables/payment.entity.ts` | 付款记录实体 | P0 |
| 22 | `shelf-erp-server/src/m13/payables/payable.service.ts` | 应付服务 | P0 |
| 23 | `shelf-erp-server/src/m13/payables/payable.controller.ts` | 应付接口 | P0 |
| 24 | `shelf-erp-server/src/m13/payables/payable.module.ts` | 应付模块 | P0 |
| 25 | `shelf-erp-server/src/m13/payables/dto/payable.dto.ts` | 应付 DTO | P0 |
| 26 | `shelf-erp-server/src/m13/bank-accounts/bank-account.entity.ts` | 银行账户实体 | P0 |
| 27 | `shelf-erp-server/src/m13/bank-accounts/bank-transaction.entity.ts` | 银行流水实体 | P0 |
| 28 | `shelf-erp-server/src/m13/bank-accounts/bank-account.service.ts` | 银行账户服务 | P0 |
| 29 | `shelf-erp-server/src/m13/bank-accounts/bank-account.controller.ts` | 银行账户接口 | P0 |
| 30 | `shelf-erp-server/src/m13/bank-accounts/bank-account.module.ts` | 银行账户模块 | P0 |
| 31 | `shelf-erp-server/src/m13/bank-accounts/dto/bank-account.dto.ts` | 银行账户 DTO | P0 |
| 32 | `shelf-erp-server/src/m13/fund-reports/fund-report.service.ts` | 资金报表服务 | P0 |
| 33 | `shelf-erp-server/src/m13/fund-reports/fund-report.controller.ts` | 资金报表接口 | P0 |
| 34 | `shelf-erp-server/src/m13/fund-reports/fund-report.module.ts` | 资金报表模块 | P0 |
| 35 | `shelf-erp-server/src/m13/fund-reports/dto/fund-report.dto.ts` | 资金报表 DTO | P0 |
| 36 | `shelf-erp-server/src/m13/month-close/month-close.entity.ts` | 月结记录实体 | P1 |
| 37 | `shelf-erp-server/src/m13/month-close/month-close.service.ts` | 月结服务 | P1 |
| 38 | `shelf-erp-server/src/m13/month-close/month-close.controller.ts` | 月结接口 | P1 |
| 39 | `shelf-erp-server/src/m13/month-close/month-close.module.ts` | 月结模块 | P1 |
| 40 | `shelf-erp-server/src/m13/month-close/dto/month-close.dto.ts` | 月结 DTO | P1 |
| 41 | `shelf-erp-server/src/m13/expenses/expense.entity.ts` | 费用报销实体 | P1 |
| 42 | `shelf-erp-server/src/m13/expenses/expense.service.ts` | 费用报销服务 | P1 |
| 43 | `shelf-erp-server/src/m13/expenses/expense.controller.ts` | 费用报销接口 | P1 |
| 44 | `shelf-erp-server/src/m13/expenses/expense.module.ts` | 费用报销模块 | P1 |
| 45 | `shelf-erp-server/src/m13/expenses/dto/expense.dto.ts` | 费用报销 DTO | P1 |
| 46 | `shelf-erp-server/src/app.module.ts` | **修改**：注册 M13Module | P0 |
| 47 | `shelf-erp-server/src/database/seeds/m13-account-seed.ts` | 科目模板种子数据 | P0 |

### 2.2 前端文件

| # | 文件路径 | 说明 | 优先级 |
|---|----------|------|--------|
| 1 | `src/types/m13.ts` | M13 全部类型定义 | P0 |
| 2 | `src/services/m13.ts` | M13 全部 API 调用 | P0 |
| 3 | `src/stores/useM13Store.ts` | M13 Zustand store | P0 |
| 4 | `src/pages/m13/AccountListPage.tsx` | 科目管理页 | P0 |
| 5 | `src/pages/m13/VoucherListPage.tsx` | 凭证列表页 | P0 |
| 6 | `src/pages/m13/VoucherEntryPage.tsx` | 凭证录入页 | P0 |
| 7 | `src/pages/m13/VoucherDetailPage.tsx` | 凭证详情页 | P0 |
| 8 | `src/pages/m13/ReceivableListPage.tsx` | 应收管理页 | P0 |
| 9 | `src/pages/m13/PayableListPage.tsx` | 应付管理页 | P0 |
| 10 | `src/pages/m13/PaymentApprovalPage.tsx` | 付款审批页 | P0 |
| 11 | `src/pages/m13/BankAccountPage.tsx` | 银行账户页 | P0 |
| 12 | `src/pages/m13/FundDailyReportPage.tsx` | 资金日报页 | P0 |
| 13 | `src/pages/m13/AgingAnalysisPage.tsx` | 账龄分析页 | P1 |
| 14 | `src/pages/m13/MonthClosePage.tsx` | 月结管理页 | P1 |
| 15 | `src/pages/m13/ExpenseReimbursementPage.tsx` | 费用报销页 | P1 |
| 16 | `src/router/index.tsx` | **修改**：新增 M13 路由块 | P0 |
| 17 | `src/layouts/MainLayout.tsx` | **修改**：侧边栏新增 M13 菜单组 | P0 |

---

## 三、数据结构和接口（类图）

### 3.1 实体关系总览

```
┌─────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Account    │  1───* │     Voucher       │  1───* │  VoucherEntry     │
│  (科目)      │        │    (凭证主表)      │        │  (凭证明细行)     │
│  自引用树形   │        │                   │        │  N:1 → Account    │
└──────┬──────┘        └────────┬──────────┘        └──────────────────┘
       │                        │
       │ (科目引用)              │ (凭证来源)
       │                        ▼
       │          ┌──────────────┼──────────────┐
       │          │              │              │
       │   ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐
       │   │AccountsRecei│ │AccountsPaya│ │ExpenseReimbur │
       │   │  vable(应收) │ │  ble(应付)  │ │  sement(报销) │
       │   └──────┬──────┘ └─────┬──────┘ └───────┬───────┘
       │          │              │                │
       │   ┌──────▼──────┐ ┌─────▼──────┐         │
       │   │  Receipt     │ │PaymentReque│         │
       │   │  (收款记录)   │ │  st(付款申请)│        │
       │   │  +Settlement │ └─────┬──────┘         │
       │   └──────┬──────┘ ┌─────▼──────┐         │
       │          │        │  Payment    │         │
       │          │        │  (实际付款)  │         │
       │          │        └─────┬──────┘         │
       │          │              │                │
       └──────────┴──────────────┴────────────────┘
                          │
                   ┌──────▼──────┐
                   │ BankAccount  │  1───*  BankTransaction(银行流水)
                   │ (银行账户)    │
                   └─────────────┘
```

### 3.2 Account（会计科目）

```typescript
@Entity('m13_accounts')
export class Account {
  @PrimaryColumn('uuid') id: string;           // = uuidv4()

  @Column({ length: 20, unique: true })
  code: string;                                 // 科目编码，4-2-2-2 层级，如 10010102

  @Column({ length: 100 })
  name: string;                                 // 科目名称

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;                      // 上级科目ID（树形自引用）

  @Column({ length: 20 })
  category: AccountCategory;                    // 资产/负债/权益/成本/损益

  @Column({ length: 4, default: 'debit' })
  balanceDirection: 'debit' | 'credit';         // 余额方向：借/贷

  @Column({ name: 'is_leaf', default: true })
  isLeaf: boolean;                              // 是否末级科目（只有末级可记账）

  @Column({ name: 'has_aux', default: false })
  hasAux: boolean;                              // 是否启用辅助核算

  @Column({ name: 'aux_types', type: 'text', nullable: true })
  auxTypes: string | null;                      // 辅助核算类型 JSON: ["project","customer","supplier"]

  @Column({ length: 10, default: 'active' })
  status: 'active' | 'inactive';               // 启用/停用

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  // 关系
  @ManyToOne(() => Account, (a) => a.children) @JoinColumn({ name: 'parent_id' }) parent: Account;
  @OneToMany(() => Account, (a) => a.parent) children: Account[];
  @OneToMany(() => VoucherEntry, (e) => e.account) entries: VoucherEntry[];
}
// AccountCategory = 'asset' | 'liability' | 'equity' | 'cost' | 'profit_loss'
```

### 3.3 Voucher + VoucherEntry（凭证 + 明细）

```typescript
@Entity('m13_vouchers')
export class Voucher {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'voucher_no', length: 30, unique: true })
  voucherNo: string;                             // 记-2026-06-0001（自动生成）

  @Column({ name: 'voucher_date', type: 'date' })
  voucherDate: string;                           // 凭证日期 YYYY-MM-DD

  @Column({ name: 'attachment_count', default: 0 })
  attachmentCount: number;                       // 附单据数

  @Column({ length: 20, default: 'draft' })
  status: VoucherStatus;                         // draft/pending/audited/posted/reversed

  @Column({ name: 'source_type', length: 30, nullable: true })
  sourceType: string | null;                     // 凭证来源：manual/contract_receipt/purchase_payment/expense/reimbursement

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId: string | null;                       // 来源单据ID

  @Column({ name: 'period', length: 7 })
  period: string;                                // 会计期间 YYYY-MM

  @Column({ name: 'debit_total', type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitTotal: number;                            // 借方合计

  @Column({ name: 'credit_total', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditTotal: number;                           // 贷方合计

  @Column({ name: 'audited_by', type: 'uuid', nullable: true }) auditedBy: string | null;
  @Column({ name: 'audited_at', type: 'datetime', nullable: true }) auditedAt: Date | null;
  @Column({ name: 'posted_by', type: 'uuid', nullable: true }) postedBy: string | null;
  @Column({ name: 'posted_at', type: 'datetime', nullable: true }) postedAt: Date | null;
  @Column({ name: 'reversed_voucher_id', type: 'uuid', nullable: true }) reversedVoucherId: string | null;

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  @OneToMany(() => VoucherEntry, (e) => e.voucher, { cascade: true }) entries: VoucherEntry[];
}
// VoucherStatus = 'draft' | 'pending' | 'audited' | 'posted' | 'reversed'

@Entity('m13_voucher_entries')
export class VoucherEntry {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'voucher_id', type: 'uuid' }) voucherId: string;
  @Column({ name: 'line_no' }) lineNo: number;           // 行号

  @Column({ length: 200 })
  summary: string;                                        // 摘要

  @Column({ name: 'account_id', type: 'uuid' }) accountId: string;
  @Column({ name: 'account_code', length: 20 }) accountCode: string;  // 冗余科目编码（查询优化）
  @Column({ name: 'account_name', length: 100 }) accountName: string;  // 冗余科目名称

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;                                          // 借方金额

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;                                         // 贷方金额

  // 辅助核算项（P1，JSON 字符串）
  @Column({ name: 'aux_project_id', type: 'uuid', nullable: true }) auxProjectId: string | null;
  @Column({ name: 'aux_customer_id', type: 'uuid', nullable: true }) auxCustomerId: string | null;
  @Column({ name: 'aux_supplier_id', type: 'uuid', nullable: true }) auxSupplierId: string | null;
  @Column({ name: 'aux_department_id', type: 'uuid', nullable: true }) auxDepartmentId: string | null;

  @ManyToOne(() => Voucher, (v) => v.entries) @JoinColumn({ name: 'voucher_id' }) voucher: Voucher;
  @ManyToOne(() => Account) @JoinColumn({ name: 'account_id' }) account: Account;
}
```

### 3.4 AccountsReceivable + Receipt（应收 + 收款）

```typescript
@Entity('m13_receivables')
export class AccountsReceivable {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'ar_no', length: 20, unique: true }) arNo: string;     // AR202606001
  @Column({ name: 'customer_id', type: 'uuid' }) customerId: string;
  @Column({ name: 'customer_name', length: 200 }) customerName: string;   // 冗余

  @Column({ name: 'contract_id', type: 'uuid', nullable: true }) contractId: string | null;  // 关联 M06 合同
  @Column({ name: 'contract_no', length: 50, nullable: true }) contractNo: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;   // 应收金额
  @Column({ name: 'settled_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  settledAmount: number;                                                  // 已核销金额
  @Column({ name: 'remaining_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;                                                // 未核销金额

  @Column({ name: 'invoice_date', type: 'date' }) invoiceDate: string;    // 立账日期
  @Column({ name: 'due_date', type: 'date' }) dueDate: string;            // 到期日

  @Column({ length: 20, default: 'unsettled' }) status: ReceivableStatus; // unsettled/partial/settled
  @Column({ name: 'source_type', length: 30, default: 'manual' }) sourceType: string; // manual/contract_auto

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true }) voucherId: string | null; // 关联立账凭证

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  @OneToMany(() => ReceiptSettlement, (s) => s.receivable) settlements: ReceiptSettlement[];
}
// ReceivableStatus = 'unsettled' | 'partial' | 'settled'

@Entity('m13_receipts')
export class Receipt {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'receipt_no', length: 20, unique: true }) receiptNo: string;  // RC202606001
  @Column({ name: 'customer_id', type: 'uuid' }) customerId: string;
  @Column({ name: 'customer_name', length: 200 }) customerName: string;

  @Column({ name: 'receipt_date', type: 'date' }) receiptDate: string;
  @Column({ name: 'bank_account_id', type: 'uuid' }) bankAccountId: string;      // 收款银行账户
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;          // 收款金额
  @Column({ length: 200, nullable: true }) summary: string | null;

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true }) voucherId: string | null; // 收款凭证

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;

  @OneToMany(() => ReceiptSettlement, (s) => s.receipt) settlements: ReceiptSettlement[];
}

@Entity('m13_receipt_settlements')
export class ReceiptSettlement {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'receipt_id', type: 'uuid' }) receiptId: string;
  @Column({ name: 'receivable_id', type: 'uuid' }) receivableId: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;  // 本次核销金额

  @ManyToOne(() => Receipt, (r) => r.settlements) @JoinColumn({ name: 'receipt_id' }) receipt: Receipt;
  @ManyToOne(() => AccountsReceivable, (a) => a.settlements) @JoinColumn({ name: 'receivable_id' }) receivable: AccountsReceivable;
}
```

### 3.5 AccountsPayable + PaymentRequest + Payment（应付 + 付款）

```typescript
@Entity('m13_payables')
export class AccountsPayable {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'ap_no', length: 20, unique: true }) apNo: string;     // AP202606001
  @Column({ name: 'supplier_id', type: 'uuid' }) supplierId: string;
  @Column({ name: 'supplier_name', length: 200 }) supplierName: string;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true }) purchaseOrderId: string | null; // 关联 M08 采购单
  @Column({ name: 'purchase_order_no', length: 50, nullable: true }) purchaseOrderNo: string | null;
  @Column({ name: 'receipt_inspection_id', type: 'uuid', nullable: true }) receiptInspectionId: string | null; // 关联 M09 入库单

  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }) paidAmount: number;
  @Column({ name: 'remaining_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }) remainingAmount: number;

  @Column({ name: 'invoice_date', type: 'date' }) invoiceDate: string;
  @Column({ name: 'due_date', type: 'date' }) dueDate: string;

  @Column({ length: 20, default: 'unpaid' }) status: PayableStatus;   // unpaid/partial/paid
  @Column({ name: 'source_type', length: 30, default: 'manual' }) sourceType: string;
  @Column({ name: 'voucher_id', type: 'uuid', nullable: true }) voucherId: string | null;

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;
}
// PayableStatus = 'unpaid' | 'partial' | 'paid'

@Entity('m13_payment_requests')
export class PaymentRequest {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'request_no', length: 20, unique: true }) requestNo: string;  // PAY202606001
  @Column({ name: 'supplier_id', type: 'uuid' }) supplierId: string;
  @Column({ name: 'supplier_name', length: 200 }) supplierName: string;

  @Column({ name: 'payable_id', type: 'uuid', nullable: true }) payableId: string | null; // 关联应付单
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;          // 申请金额
  @Column({ name: 'bank_account_id', type: 'uuid' }) bankAccountId: string;       // 付款银行账户
  @Column({ name: 'payee_account', length: 50, nullable: true }) payeeAccount: string | null; // 收款方账号
  @Column({ name: 'payee_bank', length: 100, nullable: true }) payeeBank: string | null;      // 收款方开户行
  @Column({ name: 'purpose', length: 200 }) purpose: string;                      // 付款用途
  @Column({ name: 'planned_date', type: 'date' }) plannedDate: string;            // 预计付款日

  @Column({ length: 20, default: 'pending' }) status: PaymentRequestStatus;
  // pending → approved → paid / rejected
  // 审批流按金额分档：<5万 pending→dept_manager→finance_manager→approved; >=5万 加 →general_manager→approved

  @Column({ name: 'applicant_id', type: 'uuid' }) applicantId: string;
  @Column({ name: 'applicant_name', length: 50 }) applicantName: string;
  @Column({ name: 'current_node', length: 30, nullable: true }) currentNode: string | null;

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  @OneToMany(() => PaymentApproval, (a) => a.request) approvals: PaymentApproval[];
}
// PaymentRequestStatus = 'pending' | 'approved' | 'rejected' | 'paid'

@Entity('m13_payment_approvals')
export class PaymentApproval {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'request_id', type: 'uuid' }) requestId: string;
  @Column({ length: 30 }) node: string;             // dept_manager / finance_manager / general_manager
  @Column({ name: 'approver_id', type: 'uuid', nullable: true }) approverId: string | null;
  @Column({ name: 'approver_name', length: 50, nullable: true }) approverName: string | null;
  @Column({ length: 20 }) result: 'approved' | 'rejected' | 'pending';
  @Column({ name: 'comment', type: 'text', nullable: true }) comment: string | null;
  @Column({ name: 'approved_at', type: 'datetime', nullable: true }) approvedAt: Date | null;

  @ManyToOne(() => PaymentRequest, (r) => r.approvals) @JoinColumn({ name: 'request_id' }) request: PaymentRequest;
}

@Entity('m13_payments')
export class Payment {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'payment_no', length: 20, unique: true }) paymentNo: string;   // PM202606001
  @Column({ name: 'request_id', type: 'uuid', nullable: true }) requestId: string | null;
  @Column({ name: 'payable_id', type: 'uuid', nullable: true }) payableId: string | null;
  @Column({ name: 'supplier_id', type: 'uuid' }) supplierId: string;
  @Column({ name: 'supplier_name', length: 200 }) supplierName: string;

  @Column({ name: 'payment_date', type: 'date' }) paymentDate: string;
  @Column({ name: 'bank_account_id', type: 'uuid' }) bankAccountId: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
  @Column({ length: 200, nullable: true }) summary: string | null;

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true }) voucherId: string | null; // 付款凭证

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
}
```

### 3.6 BankAccount + BankTransaction（银行账户 + 流水）

```typescript
@Entity('m13_bank_accounts')
export class BankAccount {
  @PrimaryColumn('uuid') id: string;

  @Column({ length: 50, unique: true }) code: string;        // 账户编号
  @Column({ length: 200 }) name: string;                      // 账户名称（如：招商银行基本户）
  @Column({ name: 'bank_name', length: 100 }) bankName: string; // 开户行
  @Column({ name: 'account_no', length: 50 }) accountNo: string; // 银行账号
  @Column({ length: 10, default: 'CNY' }) currency: string;  // 币种

  @Column({ name: 'opening_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: number;                                     // 期初余额
  @Column({ name: 'current_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: number;                                     // 当前余额

  @Column({ length: 10, default: 'active' }) status: 'active' | 'inactive';

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  @OneToMany(() => BankTransaction, (t) => t.bankAccount) transactions: BankTransaction[];
}

@Entity('m13_bank_transactions')
export class BankTransaction {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'bank_account_id', type: 'uuid' }) bankAccountId: string;
  @Column({ name: 'transaction_date', type: 'date' }) transactionDate: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) income: number;   // 收入
  @Column({ type: 'decimal', precision: 15, scale: 2 }) expense: number;  // 支出
  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 }) balanceAfter: number; // 交易后余额
  @Column({ length: 200, nullable: true }) summary: string | null;

  @Column({ name: 'source_type', length: 30, nullable: true }) sourceType: string | null; // receipt/payment/manual
  @Column({ name: 'source_id', type: 'uuid', nullable: true }) sourceId: string | null;

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;

  @ManyToOne(() => BankAccount, (b) => b.transactions) @JoinColumn({ name: 'bank_account_id' }) bankAccount: BankAccount;
}
```

### 3.7 FundDaily（资金日报 — 视图/DTO，非持久化）

资金日报不需要独立实体表，由 `FundReportService` 按日期实时聚合 `BankTransaction` + `BankAccount` 生成：

```typescript
export interface FundDailyReport {
  reportDate: string;                              // 报表日期
  totalIncome: number;                             // 当日总收入
  totalExpense: number;                            // 当日总支出
  totalNetFlow: number;                            // 当日净流量
  totalBalance: number;                            // 账户总余额
  accounts: FundDailyAccountItem[];
}

export interface FundDailyAccountItem {
  bankAccountId: string;
  bankAccountName: string;
  openingBalance: number;                          // 期初余额
  income: number;                                  // 收入
  expense: number;                                 // 支出
  closingBalance: number;                          // 期末余额
  transactionCount: number;                        // 笔数
}
```

### 3.8 ExpenseReimbursement（费用报销 — P1）

```typescript
@Entity('m13_expenses')
export class ExpenseReimbursement {
  @PrimaryColumn('uuid') id: string;

  @Column({ name: 'expense_no', length: 20, unique: true }) expenseNo: string; // EXP202606001
  @Column({ name: 'applicant_id', type: 'uuid' }) applicantId: string;
  @Column({ name: 'applicant_name', length: 50 }) applicantName: string;
  @Column({ name: 'expense_type', length: 30 }) expenseType: ExpenseType;      // travel/office/entertainment/logistics/other
  @Column({ name: 'expense_date', type: 'date' }) expenseDate: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
  @Column({ length: 200, nullable: true }) purpose: string | null;
  @Column({ length: 20, default: 'pending' }) status: ExpenseStatus;           // pending/approved/rejected/paid
  @Column({ name: 'current_node', length: 30, nullable: true }) currentNode: string | null;
  @Column({ name: 'payment_request_id', type: 'uuid', nullable: true }) paymentRequestId: string | null;
  @Column({ name: 'voucher_id', type: 'uuid', nullable: true }) voucherId: string | null;

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;

  @OneToMany(() => ExpenseItem, (i) => i.expense, { cascade: true }) items: ExpenseItem[];
}
// ExpenseType = 'travel' | 'office' | 'entertainment' | 'logistics' | 'other'
// ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'

@Entity('m13_expense_items')
export class ExpenseItem {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'expense_id', type: 'uuid' }) expenseId: string;
  @Column({ name: 'item_date', type: 'date' }) itemDate: string;
  @Column({ length: 200 }) description: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
  @Column({ name: 'account_id', type: 'uuid', nullable: true }) accountId: string | null; // 费用科目

  @ManyToOne(() => ExpenseReimbursement, (e) => e.items) @JoinColumn({ name: 'expense_id' }) expense: ExpenseReimbursement;
}
```

### 3.9 MonthClose（月结记录 — P1）

```typescript
@Entity('m13_month_closes')
export class MonthClose {
  @PrimaryColumn('uuid') id: string;

  @Column({ length: 7, unique: true }) period: string;  // YYYY-MM，唯一约束
  @Column({ length: 20, default: 'open' }) status: 'open' | 'closing' | 'closed';
  @Column({ name: 'closed_by', type: 'uuid', nullable: true }) closedBy: string | null;
  @Column({ name: 'closed_at', type: 'datetime', nullable: true }) closedAt: Date | null;
  @Column({ name: 'debit_total', type: 'decimal', precision: 15, scale: 2, default: 0 }) debitTotal: number;
  @Column({ name: 'credit_total', type: 'decimal', precision: 15, scale: 2, default: 0 }) creditTotal: number;
  @Column({ name: 'profit_transferred', default: false }) profitTransferred: boolean; // 损益是否已结转
  @Column({ name: 'reversal_reason', type: 'text', nullable: true }) reversalReason: string | null; // 反月结原因

  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'uuid' }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt: Date;
}
```

---

## 四、程序调用流程（时序图）

### 4.1 凭证创建流程

```
用户(会计)          VoucherEntryPage       useM13Store         m13.ts API        VoucherController      VoucherService          AccountService
    │                    │                    │                    │                    │                      │                       │
    │  录入凭证分录       │                    │                    │                    │                      │                       │
    │───────────────────>│                    │                    │                    │                      │                       │
    │                    │  实时计算借贷平衡    │                    │                    │                      │                       │
    │                    │  (前端校验)         │                    │                    │                      │                       │
    │  点击"保存并提交"   │                    │                    │                    │                      │                       │
    │───────────────────>│  createVoucher()   │                    │                    │                      │                       │
    │                    │───────────────────>│  POST /m13/vouchers│                    │                      │                       │
    │                    │                    │───────────────────>│                    │                      │                       │
    │                    │                    │                    │  create(dto,userId)│                      │                       │
    │                    │                    │                    │──────────────────>│                      │                       │
    │                    │                    │                    │                    │  1.生成凭证字号        │                       │
    │                    │                    │                    │                    │    (记-YYYY-MM-序号)  │                       │
    │                    │                    │                    │                    │                      │                       │
    │                    │                    │                    │                    │  2.校验每行科目有效性  │                       │
    │                    │                    │                    │                    │─────────────────────────────────────────────>│
    │                    │                    │                    │                    │                      │  findOne(accountId)   │
    │                    │                    │                    │                    │                      │  校验 isLeaf===true    │
    │                    │                    │                    │                    │<─────────────────────────────────────────────│
    │                    │                    │                    │                    │                      │                       │
    │                    │                    │                    │                    │  3.mathjs 校验借贷平衡 │                       │
    │                    │                    │                    │                    │    debitSum===creditSum│                      │
    │                    │                    │                    │                    │    (精度安全)          │                       │
    │                    │                    │                    │                    │                      │                       │
    │                    │                    │                    │                    │  4.开启事务(queryRunner)│                      │
    │                    │                    │                    │                    │    保存 Voucher + entries│                     │
    │                    │                    │                    │                    │    设置 status=pending │                       │
    │                    │                    │                    │                    │    提交事务            │                       │
    │                    │                    │                    │                    │                      │                       │
    │                    │                    │                    │<──────────────────│  return Voucher       │                       │
    │                    │                    │<───────────────────│                    │                      │                       │
    │  提示"保存成功"     │<───────────────────│                    │                    │                      │                       │
    │<───────────────────│                    │                    │                    │                      │                       │

后续审核流程：
  审核人点击"审核" → PUT /m13/vouchers/:id/audit
    → VoucherService.audit(id, userId)
    → 校验：status===pending && auditBy !== createdBy（审核人≠录入人）
    → 更新 status=audited, auditedBy, auditedAt

  过账流程：
  点击"过账" → PUT /m13/vouchers/:id/post
    → VoucherService.post(id, userId)
    → 校验：status===audited
    → 检查所属期间是否已锁定（MonthClose.status===closed）
    → 更新 status=posted, postedBy, postedAt
    → 写入操作日志（不可篡改）

  红字冲销：
  点击"红字冲销" → POST /m13/vouchers/:id/reverse
    → VoucherService.reverse(id, userId)
    → 校验：status===posted
    → 生成红字凭证（借贷方向反转，金额取负）
    → 原 voucher.reversedVoucherId = 新凭证ID
    → 原 voucher.status = reversed
```

### 4.2 收款核销流程

```
出纳(老张)        ReceivableListPage    useM13Store      m13.ts API       ReceivableController    ReceivableService        VoucherService      BankAccountService
    │                   │                  │                 │                    │                      │                      │                   │
    │  点击"登记收款"    │                  │                 │                    │                      │                      │                   │
    │──────────────────>│  弹出收款抽屉     │                 │                    │                      │                      │                   │
    │                   │  选择客户 → 拉取未核销应收单          │                    │                      │                      │                   │
    │                   │  GET /m13/receivables?customerId=&status=unsettled,partial              │                      │                      │                   │
    │                   │─────────────────>│────────────────>│───────────────────>│                      │                      │                   │
    │                   │                  │                 │  findAll(dto)      │                      │                      │                   │
    │                   │                  │                 │──────────────────>│                      │                      │                   │
    │                   │<─────────────────│<────────────────│<──────────────────│  return [应收单列表]  │                      │                   │
    │                   │                  │                 │                    │                      │                      │                   │
    │  勾选核销单据       │                  │                 │                    │                      │                      │                   │
    │  输入收款金额       │                  │                 │                    │                      │                      │                   │
    │  确认收款           │                 │                 │                    │                      │                      │                   │
    │──────────────────>│  createReceipt() │                 │                    │                      │                      │                   │
    │                   │─────────────────>│  POST /m13/receivables/receipts     │                      │                      │                   │
    │                   │                  │────────────────>│                    │                      │                      │                   │
    │                   │                  │                 │  createReceipt(dto,userId)                │                      │                   │
    │                   │                  │                 │──────────────────>│                      │                      │                   │
    │                   │                  │                 │                    │  开启事务             │                      │                   │
    │                   │                  │                 │                    │  1.生成收款单号        │                      │                   │
    │                   │                  │                 │                    │    RC202606001        │                      │                   │
    │                   │                  │                 │                    │  2.保存 Receipt       │                      │                   │
    │                   │                  │                 │                    │  3.按勾选顺序核销：     │                      │                   │
    │                   │                  │                 │                    │    for each receivable:                     │                   │
    │                   │                  │                 │                    │      核销额=min(收款剩余,应收未核销)          │                   │
    │                   │                  │                 │                    │      创建 ReceiptSettlement                 │                   │
    │                   │                  │                 │                    │      更新 receivable.settledAmount           │                   │
    │                   │                  │                 │                    │      更新 receivable.remainingAmount        │                   │
    │                   │                  │                 │                    │      更新 status: unsettled→partial→settled  │                   │
    │                   │                  │                 │                    │  4.生成收款凭证：       │                      │                   │
    │                   │                  │                 │                    │    借: 银行存款(收款账户)│                     │                   │
    │                   │                  │                 │                    │    贷: 应收账款(客户)   │                      │                   │
    │                   │                  │                 │                    │────────────────────────────────────────────>│                   │
    │                   │                  │                 │                    │  createVoucher(source=contract_receipt)      │                   │
    │                   │                  │                 │                    │<────────────────────────────────────────────│                   │
    │                   │                  │                 │                    │  5.更新银行账户余额：     │                      │                   │
    │                   │                  │                 │                    │    bankAccount.currentBalance += amount      │                   │
    │                   │                  │                 │                    │    创建 BankTransaction(income=amount)       │                   │
    │                   │                  │                 │                    │──────────────────────────────────────────────────────────────────>│
    │                   │                  │                 │                    │                      │                      │  recordTransaction()│
    │                   │                  │                 │                    │<──────────────────────────────────────────────────────────────────│
    │                   │                  │                 │                    │  6.提交事务            │                      │                   │
    │                   │                  │                 │<──────────────────│  return Receipt       │                      │                   │
    │                   │<─────────────────│<────────────────│                    │                      │                      │                   │
    │  提示"收款成功"     │<────────────────│                 │                    │                      │                      │                   │
```

### 4.3 付款申请流程

```
采购员            PayableListPage   useM13Store    m13.ts API    PayableController   PayableService        VoucherService    BankAccountService
  │                    │                │              │                  │                  │                    │                 │
  │  点击"付款申请"     │               │              │                  │                  │                    │                 │
  │──────────────────>│  弹出申请抽屉   │              │                  │                  │                    │                 │
  │  选择供应商→拉取未付款应付单          │              │                  │                  │                    │                 │
  │  选择关联应付单(自动带出金额)         │              │                  │                  │                    │                 │
  │  填写收款方/用途/预计付款日           │              │                  │                  │                    │                 │
  │  提交申请           │              │              │                  │                  │                    │                 │
  │──────────────────>│ createPaymentRequest()       │              │                  │                    │                 │
  │                    │───────────────>│ POST /m13/payables/payment-requests        │                  │                    │                 │
  │                    │                │─────────────>│                  │                  │                    │                 │
  │                    │                │              │  createRequest() │                  │                    │                 │
  │                    │                │              │────────────────>│                  │                    │                 │
  │                    │                │              │                  │  1.生成申请单号    │                    │                 │
  │                    │                │              │                  │    PAY202606001   │                    │                 │
  │                    │                │              │                  │  2.确定审批链：     │                    │                 │
  │                    │                │              │                  │    amount<50000 → [dept_manager, finance_manager]      │                 │
  │                    │                │              │                  │    amount>=50000 → [dept_manager, finance_manager, general_manager]│
  │                    │                │              │                  │  3.创建 PaymentApproval 节点(全部 pending)              │                 │
  │                    │                │              │                  │  4.status=pending, currentNode=dept_manager            │                 │
  │                    │                │              │                  │  5.保存 PaymentRequest                                │                 │
  │                    │                │              │<────────────────│  return PaymentRequest                               │                 │
  │  提示"已提交"       │<───────────────│<─────────────│                  │                  │                    │                 │
  │<──────────────────│                │              │                  │                  │                    │                 │

审批阶段（部门经理 → 财务经理 → [总经理]）：
  审批人 → PaymentApprovalPage → PUT /m13/payment-requests/:id/approve
    → PayableService.approve(id, { result, comment }, userId)
    → 校验：当前用户是 currentNode 对应角色
    → 更新当前 PaymentApproval 节点：result=approved/rejected, approverId, approvedAt
    → 若 rejected → request.status=rejected，流程终止
    → 若 approved 且有下一节点 → currentNode 前进
    → 若 approved 且是最后节点 → request.status=approved

出纳付款阶段：
  出纳 → 付款审批通过列表 → 点击"付款" → POST /m13/payables/payments
    → PayableService.createPayment(dto, userId)
    → 开启事务：
      1.生成付款单号 PM202606001
      2.保存 Payment，关联 paymentRequestId
      3.核销应付单（更新 payable.paidAmount / remainingAmount / status）
      4.生成付款凭证：借:应付账款  贷:银行存款
        → VoucherService.createVoucher(source=purchase_payment)
      5.更新银行账户余额：currentBalance -= amount
        → BankAccountService.recordTransaction(expense=amount)
      6.更新 request.status=paid
      7.提交事务
```

---

## 五、任务列表（有序、含依赖关系、按实现顺序排列）

```
Task 1:  后端骨架 + 科目管理 - 依赖：无 - 文件：m13.module.ts, accounts/(entity/service/controller/module/dto), app.module.ts(修改), m13-account-seed.ts
Task 2:  凭证管理（录入/审核/过账） - 依赖：Task 1 - 文件：vouchers/(entity/entity-entry/service/controller/module/dto)
Task 3:  银行账户 + 流水管理 - 依赖：Task 1 - 文件：bank-accounts/(entity/entity-tx/service/controller/module/dto)
Task 4:  应收管理（立账 + 收款核销） - 依赖：Task 2, Task 3 - 文件：receivables/(entity/entity-receipt/service/controller/module/dto)
Task 5:  应付管理（立账 + 付款申请 + 审批 + 付款） - 依赖：Task 2, Task 3 - 文件：payables/(entity-entity-request-entity-payment/service/controller/module/dto)
Task 6:  资金日报 + 试算平衡表 - 依赖：Task 2, Task 3 - 文件：fund-reports/(service/controller/module/dto)
Task 7:  前端类型定义 + API 服务层 + Store - 依赖：Task 1-6 - 文件：types/m13.ts, services/m13.ts, stores/useM13Store.ts
Task 8:  前端科目管理页 - 依赖：Task 7 - 文件：pages/m13/AccountListPage.tsx
Task 9:  前端凭证列表+录入+详情页 - 依赖：Task 7, Task 8 - 文件：pages/m13/VoucherListPage.tsx, VoucherEntryPage.tsx, VoucherDetailPage.tsx
Task 10: 前端应收管理页 - 依赖：Task 7 - 文件：pages/m13/ReceivableListPage.tsx
Task 11: 前端应付管理+付款审批页 - 依赖：Task 7 - 文件：pages/m13/PayableListPage.tsx, PaymentApprovalPage.tsx
Task 12: 前端银行账户+资金日报页 - 依赖：Task 7 - 文件：pages/m13/BankAccountPage.tsx, FundDailyReportPage.tsx
Task 13: 前端路由注册 + 侧边栏菜单 - 依赖：Task 8-12 - 文件：router/index.tsx(修改), layouts/MainLayout.tsx(修改)
Task 14: 月结管理（后端+前端） - 依赖：Task 2, Task 13 - 文件：month-close/(全部), pages/m13/MonthClosePage.tsx
Task 15: 账龄分析（后端+前端） - 依赖：Task 4, Task 5, Task 13 - 文件：fund-reports/(扩展), pages/m13/AgingAnalysisPage.tsx
Task 16: 费用报销（后端+前端） - 依赖：Task 5, Task 13 - 文件：expenses/(全部), pages/m13/ExpenseReimbursementPage.tsx
Task 17: 集成测试 + 种子数据完善 - 依赖：Task 1-16 - 文件：database/seeds/m13-account-seed.ts(完善)
```

### 任务依赖关系图

```
Task 1 (科目)
  ├──> Task 2 (凭证) ──┬──> Task 4 (应收) ──┐
  │                     ├──> Task 5 (应付) ──┤
  │                     └──> Task 6 (资金报表)│
  └──> Task 3 (银行) ───┘                    │
                                             ▼
                                      Task 7 (前端基础)
                                       ├──> Task 8  (科目页)
                                       ├──> Task 9  (凭证页) <── Task 8
                                       ├──> Task 10 (应收页)
                                       ├──> Task 11 (应付页)
                                       └──> Task 12 (银行页)
                                             │
                                      Task 13 (路由+菜单) <── Task 8-12
                                       │
                       ┌───────────────┼───────────────┐
                       ▼               ▼               ▼
                 Task 14 (月结)  Task 15 (账龄)  Task 16 (报销)
                       │               │               │
                       └───────────────┼───────────────┘
                                       ▼
                                 Task 17 (集成测试)
```

---

## 六、依赖包列表

### 6.1 后端新增依赖

| 包名 | 版本 | 用途 | 是否必须 |
|------|------|------|----------|
| 无新增 | - | - | - |

**说明**：现有依赖已覆盖 M13 所有需求：
- `mathjs` ^12.4.3 — 借贷平衡精确计算（避免 SQLite REAL 浮点误差）
- `dayjs` ^1.11.13 — 日期处理（会计期间、账龄计算）
- `class-validator` + `class-transformer` — DTO 校验
- `uuid` ^9.0.1 — 主键生成
- `better-sqlite3` ^12.11.1 — SQLite 驱动（已安装）
- `@nestjs/swagger` — 接口文档

### 6.2 前端新增依赖

| 包名 | 版本 | 用途 | 是否必须 |
|------|------|------|----------|
| 无新增 | - | - | - |

**说明**：现有依赖已覆盖：
- `@mui/material` + `@mui/icons-material` — UI 组件
- `zustand` ^4.5.2 — 状态管理
- `axios` ^1.7.2 — HTTP 请求
- `dayjs` ^1.11.11 — 日期处理
- `recharts` ^2.12.7 — 账龄分析图表（如需可视化）
- `react-hook-form` ^7.51.5 — 凭证录入表单
- `lodash-es` — 工具函数

---

## 七、共享知识（跨文件约定）

### 7.1 凭证编号规则

**格式**：`记-YYYY-MM-NNNN`

- `记` — 固定前缀（记账凭证）
- `YYYY-MM` — 会计期间，取自 `voucherDate` 的年月
- `NNNN` — 月内流水号，4 位补零，从 0001 开始

**示例**：`记-2026-06-0001`

**生成逻辑**（`VoucherService.generateVoucherNo()`）：
```typescript
// 查询当前期间最大流水号 +1
const prefix = `记-${period}-`;
const last = await this.voucherRepo
  .createQueryBuilder('v')
  .where('v.voucher_no LIKE :prefix', { prefix: `${prefix}%` })
  .orderBy('v.voucher_no', 'DESC')
  .getOne();
const seq = last ? parseInt(last.voucherNo.slice(-4), 10) + 1 : 1;
return `${prefix}${String(seq).padStart(4, '0')}`;
```

### 7.2 科目编码规则

**格式**：4-2-2-2 层级，最多 4 级，编码总长 4-10 位

| 级别 | 编码长度 | 示例 | 说明 |
|------|----------|------|------|
| 一级 | 4 位 | `1001` | 库存现金 |
| 二级 | 4+2=6 位 | `100101` | 人民币现金 |
| 三级 | 4+2+2=8 位 | `10010101` | 某出纳现金 |
| 四级 | 4+2+2+2=10 位 | `1001010101` | （极少使用） |

**五大类别编码区间**（新企业会计准则）：

| 类别 | 编码前缀 | 典型科目 |
|------|----------|----------|
| 资产 | 1xxx | 1001 库存现金、1002 银行存款、1122 应收账款、1221 其他应收款、1601 固定资产 |
| 负债 | 2xxx | 2202 应付账款、2203 预收账款、2241 其他应付款、2501 长期借款 |
| 权益 | 4xxx | 4001 实收资本、4101 盈余公积、4103 本年利润、4104 利润分配 |
| 成本 | 5xxx | 5001 生产成本、5101 制造费用 |
| 损益 | 6xxx | 6001 主营业务收入、6401 主营业务成本、6601 销售费用、6602 管理费用、6603 财务费用 |

**编码生成逻辑**（`AccountService.generateCode(parentId)`）：
- 无上级 → 用户输入 4 位一级编码
- 有上级 → 父编码 + 2 位序号（查询同级最大序号 +1）

### 7.3 应收/应付账龄计算逻辑

**计算基准日**：用户选择的报表日期（默认当天）

**账龄分段**：`0-30天` / `31-60天` / `61-90天` / `91-180天` / `180天以上`

**计算方式**：按应收单的**到期日**（`due_date`）计算，非立账日期

```typescript
// 账龄计算核心逻辑（FundReportService.getAgingAnalysis）
function calcAging(dueDate: string, reportDate: string, remainingAmount: number): AgingBucket {
  const due = dayjs(dueDate);
  const report = dayjs(reportDate);
  const overdueDays = report.diff(due, 'day'); // 已逾期天数

  // 未到期 → 归入 0-30 天段（实际未逾期，但为统一展示放在第一列）
  if (overdueDays <= 0) return { bucket: '0-30', amount: remainingAmount };

  if (overdueDays <= 30) return { bucket: '0-30', amount: remainingAmount };
  if (overdueDays <= 60) return { bucket: '31-60', amount: remainingAmount };
  if (overdueDays <= 90) return { bucket: '61-90', amount: remainingAmount };
  if (overdueDays <= 180) return { bucket: '91-180', amount: remainingAmount };
  return { bucket: '180+', amount: remainingAmount };
}
```

**注意**：账龄计算基于 `remaining_amount`（未核销/未付款余额），非原始立账金额。已核销部分不参与账龄统计。

### 7.4 金额精度约定

- 所有金额字段统一 `decimal(15,2)`，最大支持 999,999,999,999.99
- SQLite 实际存储为 REAL（浮点），**所有金额计算必须使用 `mathjs`**：
  ```typescript
  import { add, subtract, multiply, equal, bignumber } from 'mathjs';
  const debitSum = entries.reduce((sum, e) => add(sum, bignumber(e.debit)), bignumber(0));
  const creditSum = entries.reduce((sum, e) => add(sum, bignumber(e.credit)), bignumber(0));
  if (!equal(debitSum, creditSum)) throw new BadRequestException('借贷不平衡');
  ```
- 前端展示统一 `toFixed(2)` + 千分位格式化

### 7.5 凭证状态机

```
draft(草稿) ──submit──> pending(待审核) ──audit──> audited(已审核) ──post──> posted(已过账)
                               │                                              │
                               └──reject──> draft(退回草稿)                    └──reverse──> reversed(已冲销)
                                                                              (生成红字凭证)
```

- `draft` → 可编辑删除
- `pending` → 不可编辑，等待审核
- `audited` → 不可编辑，可过账
- `posted` → 不可修改，需红字冲销
- `reversed` → 已被红字冲销，不可任何操作

### 7.6 凭证来源标识

| sourceType | 含义 | 来源单据 | 自动生成场景 |
|------------|------|----------|-------------|
| `manual` | 手工录入 | 无 | 会计在凭证录入页手工创建 |
| `contract_receipt` | 合同回款 | Receipt | 收款核销时自动生成 |
| `purchase_payment` | 采购付款 | Payment | 出纳付款时自动生成 |
| `expense` | 费用报销 | ExpenseReimbursement | 报销审批通过后生成 |
| `month_close` | 月结结转 | MonthClose | 损益结转时自动生成 |
| `reversal` | 红字冲销 | 原 Voucher | 冲销已过账凭证时生成 |

### 7.7 API 路由前缀约定

所有 M13 接口路由以 `/m13/` 为前缀，与 Controller 装饰器一致：

| 资源 | 路由前缀 | 示例 |
|------|----------|------|
| 科目 | `/m13/accounts` | `GET /m13/accounts/tree` |
| 凭证 | `/m13/vouchers` | `POST /m13/vouchers/:id/audit` |
| 应收 | `/m13/receivables` | `POST /m13/receivables/receipts` |
| 应付 | `/m13/payables` | `POST /m13/payables/payment-requests` |
| 付款 | `/m13/payments` | `POST /m13/payments` |
| 银行账户 | `/m13/bank-accounts` | `GET /m13/bank-accounts/:id/transactions` |
| 资金报表 | `/m13/fund-reports` | `GET /m13/fund-reports/daily?date=2026-06-21` |
| 账龄 | `/m13/fund-reports/aging` | `GET /m13/fund-reports/aging?type=receivable&date=2026-06-30` |
| 月结 | `/m13/month-close` | `POST /m13/month-close/close` |

### 7.8 前端路由约定

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/m13/accounts` | AccountListPage | P0 |
| `/m13/vouchers` | VoucherListPage | P0 |
| `/m13/vouchers/new` | VoucherEntryPage | P0 |
| `/m13/vouchers/:id` | VoucherDetailPage | P0 |
| `/m13/receivables` | ReceivableListPage | P0 |
| `/m13/payables` | PayableListPage | P0 |
| `/m13/payment-approval` | PaymentApprovalPage | P0 |
| `/m13/bank-accounts` | BankAccountPage | P0 |
| `/m13/fund-daily` | FundDailyReportPage | P0 |
| `/m13/aging` | AgingAnalysisPage | P1 |
| `/m13/month-close` | MonthClosePage | P1 |
| `/m13/expense` | ExpenseReimbursementPage | P1 |

---

## 八、待明确事项

### 8.1 需产品经理（许清楚）确认

| # | 事项 | 影响 | 当前处理 | 建议确认方向 |
|---|------|------|----------|-------------|
| 1 | 科目模板：直接预置新企业会计准则标准科目，还是公司有自定义科目表？ | Task 1 种子数据 | 先预置标准模板，上线时微调 | 需公司现有科目表 Excel |
| 2 | 辅助核算维度 P1 启用范围：项目/部门/客户/供应商 全部启用还是分批？ | VoucherEntry 实体字段 | 实体预留全部字段，P1 先实现项目+客户/供应商 | 部门核算延后 |
| 3 | 收款核销是否限制单客户？PRD Q5 建议单客户 | ReceivableService 核销逻辑 | 按单客户实现 | 确认是否有多客户合并核销场景 |
| 4 | 付款审批金额分档：5万为界是否准确？ | PaymentRequest 审批链 | 按 PRD Q6 建议实现：5万以下两级，5万以上三级 | 确认阈值和审批角色 |
| 5 | 反月结是否允许？什么条件？ | MonthCloseService | 按 PRD Q10 建议：仅财务经理操作，需填原因留痕 | 确认权限和流程 |
| 6 | 银行流水 P0 是否纯手工录入？ | BankTransactionService | 手工录入，P2 考虑 CSV 导入 | 确认是否有网银对接需求 |

### 8.2 需用户/业务方确认

| # | 事项 | 影响 | 当前处理 |
|---|------|------|----------|
| 7 | 公司现有银行账户清单（开户行、账号、币种、期初余额） | BankAccount 种子数据 | 先建空表，用户上线时录入 |
| 8 | 外币账户需求：是否涉及多币种核算？ | BankAccount.currency 字段 | 预留 currency 字段，P0 只支持 CNY |
| 9 | 坏账计提方法及比例（P2） | AgingAnalysis 扩展 | P2 实现，不影响 P0/P1 |

### 8.3 技术决策点

| # | 事项 | 决策 | 理由 |
|---|------|------|------|
| 10 | M06 已有 `payment_plans` 和 `invoices` 表，M13 应收是否复用？ | **新建** `m13_receivables` 表 | M06 的 payment_plans 是回款计划（预期），M13 的应收单是财务立账（实际），语义不同。M13 应收单引用 M06 合同ID 做关联 |
| 11 | M08 采购入库触发应付立账方式？ | 采购入库确认后**自动生成应付单草稿**，财务确认后正式立账 | 避免业务侧直接产生财务凭证，财务有审核关口 |
| 12 | SQLite 并发写入限制 | 单实例部署，过账等关键操作加事务 + version 乐观锁 | better-sqlite3 同步驱动，单进程内串行，满足财务模块并发量 |
| 13 | 科目余额是否独立表存储？ | P0 不建独立余额表，余额由 `VoucherEntry` 实时聚合计算 | 凭证量小，实时聚合性能足够；P1 月结时缓存期末余额到 MonthClose |
| 14 | 资金日报是否预生成？ | 实时聚合 `BankTransaction`，不预生成 | 数据量小，实时查询即可，避免数据不一致 |
| 15 | 导出 Excel 功能实现方式 | 后端用 JSON 生成 CSV（避免引入 exceljs 依赖），前端 Blob 下载 | 最小依赖原则，CSV 兼容 Excel 打开 |

---

> **下一步**：与产品经理确认第八节待明确事项后，按第五节任务列表顺序进入开发阶段。建议从 Task 1（科目管理）开始，它是所有财务模块的基础。
