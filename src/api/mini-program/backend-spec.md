/**
 * 微信小程序 API - 后端NestJS模块设计文档
 * =======================================
 *
 * 本文件描述了后端需要实现的接口规范。
 * 前端API客户端定义见 types.ts
 *
 * ## 模块结构 (shelf-erp-server/src/mp/)
 *
 * mp/
 * ├── mp.module.ts          # 模块注册
 * ├── mp.controller.ts       # 路由控制器
 * ├── mp.service.ts         # 业务逻辑
 * ├── mp-auth/
 * │   ├── mp-auth.controller.ts    # 微信登录
 * │   └── mp-auth.service.ts      # code2Session + JWT签发
 * ├── mp-customer/
 * │   └── mp-customer.controller.ts # 客户CRUD(精简)
 * ├── mp-quotation/
 * │   └── mp-quotation.controller.ts # 报价查询/提交
 * ├── mp-production/
 * │   └── mp-production.controller.ts # 扫码报工
 * ├── mp-warehouse/
 * │   └── mp-warehouse.controller.ts  # 扫码出入库
 * └── dto/
     ├── wx-login.dto.ts
     ├── paged-query.dto.ts
     └── scan-operation.dto.ts
 *
 * ## 认证流程
 *
 * ┌──────────┐    code      ┌──────────────┐   token     ┌──────────┐
 * │  微信小程序  │ ──────────→ │  WeChat API  │ ─────────→ │ NestJS   │
 * │  (前端)    │ ←───────── │ code2Session │ ←─────────│ 后端      │
 * └──────────┘  session_key  └──────────────┘   JWT       └──────────┘
 *       ↑                                              ↓
 *       │                                        ┌──────────┐
 *       └──────────────────────────────────────→│ PostgreSQL│
 *                                                │ (用户表)   │
 *                                                └──────────┘
 *
 * ## 关键接口实现要点
 *
 * ### 1. 微信登录 POST /api/mp/auth/login
 * - 接收 { code: string }
 * - 调用微信 code2Session API 获取 openid + session_key
 * - 查找或创建本地用户记录（绑定 openId）
 * - 签发 JWT token（payload 含 userId + role）
 * - 返回 { token, expiresAt, user }
 *
 * ### 2. 扫码报工 POST /api/mp/work-orders/:woId/processes/:psId/start
 * - 校验token → 确认用户有"生产"角色权限
 * - 记录工序开始时间
 * - 可选：接收拍照临时路径（后续上传到OSS）
 *
 * ### 3. 扫码出入库 POST /api/mp/inventory/inbound 或 /outbound
 * - 解析扫码内容（条码格式：仓库区+货位+物料编码+数量）
 * - 创建入库/出库记录
 * - 更新库存数量
 * - 触发低库存预警检查
 *
 * ### 4. 增量同步 GET /api/mp/sync/changes?since=1705000000
 * - 基于 updatedAt 过滤变更数据
 * - 返回按表分组的变更记录
 * - 支持 last-sync-version 机制避免遗漏
 */

// ===== DTO 类型定义（后端用）=====

export class WxLoginDto {
  /** wx.login() 获取的code */
  code: string;
}

export class PagedQueryDto {
  page: number = 1;
  pageSize: number = 20;
  keyword?: string;
  since?: number; // Unix timestamp for incremental sync
}

export class ScanStartProcessDto {
  /** 工序实际开始时间（可选，默认服务端时间） */
  startedAt?: string;
  /** 备注 */
  remark?: string;
}

export class ScanCompleteProcessDto {
  /** 工序完成时间 */
  completedAt?: string;
  /** 实际耗时（分钟） */
  actualMinutes?: number;
  /** 备注 */
  remark?: string;
  /** 附件照片ID列表（已上传的） */
  photoIds?: string[];
}

export class ScanInventoryDto {
  /** 扫码内容（条码字符串） */
  barcode: string;
  /** 数量 */
  quantity: number;
  /** 批次号 */
  batchNo?: string;
  /** 来源/目标单据Id */
  refOrderId?: string;
  /** 备注 */
  remark?: string;
}
