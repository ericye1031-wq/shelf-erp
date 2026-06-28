import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../m02/customers/customer.entity';
import { Contact } from '../../m02/customers/contact.entity';
import { Opportunity } from '../../m02/opportunities/opportunity.entity';
import { Inquiry } from '../../m02/inquiries/inquiry.entity';
import { ShelfType, ParameterDef } from '../../m04/shelf-types/shelf-type.entity';
import { Specification } from '../../m04/specifications/specification.entity';
import { Contract, ContractStatus } from '../../m06/contracts/contract.entity';
import { Project, ProjectStatus } from '../../m07/projects/project.entity';
import { User } from '../../m01/users/user.entity';
import { Currency } from '../../m05/currencies/currency.entity';
import { Quotation, QuotationStatus } from '../../m05/quotations/quotation.entity';
import { CostItem } from '../../m05/quotations/cost-item.entity';
import { QuotationVersion } from '../../m05/quotations/quotation-version.entity';
import { PurchaseOrder, PurchaseStatus } from '../../m08/purchases/purchase-order.entity';
import { PurchaseItem } from '../../m08/purchases/purchase-item.entity';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../m10/work-orders/work-order.entity';
import { ProcessStep, ProcessStepStatus } from '../../m10/work-orders/process-step.entity';
import { Warehouse } from '../../m11/warehouses/warehouse.entity';
import { Inventory, InventoryTransaction } from '../../m11/warehouses/inventory.entity';
import { CostDimension, CostDimensionType } from '../../m12/costs/cost-dimension.entity';
import { CostAlert, CostAlertLevel } from '../../m12/costs/cost-alert.entity';
import { BOM } from '../../m08/boms/bom.entity';
import { BomItem } from '../../m08/boms/bom-item.entity';
import { BomVersion } from '../../m08/boms/bom-version.entity';
import { AlternativeMaterial } from '../../m08/boms/alternative-material.entity';
import { Equipment } from '../../m10/equipment/equipment.entity';
import { ScheduleItem } from '../../m10/schedule/schedule.entity';
import { ScanRecord } from '../../m10/scan-records/scan-record.entity';
import { ServiceTicket, ServiceTicketStatus, ServiceType } from '../../m16/service-tickets/service-ticket.entity';
import { Repair, RepairStatus, FaultLevel } from '../../m16/repairs/repair.entity';
import { Inspection, InspectionStatus, InspectionResult as M16InspectionResult, InspectionType } from '../../m16/inspections/inspection.entity';
import { ReturnVisit, ReturnVisitStatus, VisitMethod } from '../../m16/return-visits/return-visit.entity';
import { Warranty, WarrantyStatus, WarrantyType } from '../../m16/warranties/warranty.entity';
import { QualityCheck } from '../../m10/quality-checks/quality-check.entity';
import { Defect } from '../../m10/quality-checks/defect.entity';
import { OeeData } from '../../m10/oee/oee.entity';
import { ProcessRoute } from '../../m10/process-routes/process-route.entity';
import { ProcessRouteStep } from '../../m10/process-routes/process-route-step.entity';
import { MaterialDemand } from '../../m10/material-demands/material-demand.entity';
import { Supplier, SupplierStatus, SupplierRating } from '../../m09/suppliers/supplier.entity';
import { PurchaseRequisition, RequisitionStatus, RequisitionUrgency } from '../../m09/requisitions/purchase-requisition.entity';
import { ReceivingInspection, InspectionResult, InspectionOverallResult } from '../../m09/inspections/receiving-inspection.entity';
import { Scheme, SchemeStatus } from '../../m03/design-schemes/scheme.entity';
import { SchemeVersion } from '../../m03/design-schemes/scheme-version.entity';
import { Drawing, DrawingStatus, DrawingCategory } from '../../m03/drawings/drawing.entity';
import { InstallPlan } from '../../m15/install-plans/install-plan.entity';
import { InstallTeam } from '../../m15/install-teams/install-team.entity';
import { InstallReport } from '../../m15/install-reports/install-report.entity';
import { InstallCost } from '../../m15/install-costs/install-cost.entity';
import { InstallIssue } from '../../m15/install-issues/install-issue.entity';
import { InstallAcceptance } from '../../m15/install-acceptances/install-acceptance.entity';
import { runM13AccountSeed } from './m13-account-seed';
import { BankAccount } from '../../m13/bank-accounts/bank-account.entity';
import { BankTransaction } from '../../m13/bank-accounts/bank-transaction.entity';
import { Voucher } from '../../m13/vouchers/voucher.entity';
import { VoucherEntry } from '../../m13/vouchers/voucher-entry.entity';
import { AccountsReceivable } from '../../m13/receivables/receivable.entity';
import { Receipt } from '../../m13/receivables/receipt.entity';
import { AccountsPayable } from '../../m13/payables/payable.entity';
import { Payment } from '../../m13/payables/payment.entity';
import { PaymentRequest } from '../../m13/payables/payment-request.entity';
import { Account } from '../../m13/accounts/account.entity';
import { Employee } from '../../m14/employees/employee.entity';
import { AttendanceRecord } from '../../m14/attendance/attendance-record.entity';
import { SalaryRecord } from '../../m14/salary/salary-record.entity';
import { TrainingRecord } from '../../m14/training/training-record.entity';
import { PerformanceReview } from '../../m14/performance/performance-review.entity';
import { Dashboard, DashboardType } from '../../m17/dashboards/dashboard.entity';
import { Report, ReportType, ReportFormat } from '../../m17/reports/report.entity';
import { KPI, KPIType, KPIUnit, KPITrend } from '../../m17/kpis/kpi.entity';
import { DataSource as M17DataSourceEntity, DataSourceType } from '../../m17/data-sources/data-source.entity';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * 核心业务种子数据 — 客户、货架类型、合同、项目
 */
export async function runBusinessSeed(dataSource: DataSource): Promise<void> {
  console.log('📦 运行核心业务种子数据...');

  // 查找 admin 用户作为 createdBy
  const userRepo = dataSource.getRepository(User);
  const admin = await userRepo.findOne({ where: { username: 'admin' } });
  const adminId = admin?.id || SYSTEM_USER_ID;

  // ─── M02 客户 ───
  const customerRepo = dataSource.getRepository(Customer);
  const contactRepo = dataSource.getRepository(Contact);
  const opportunityRepo = dataSource.getRepository(Opportunity);
  const inquiryRepo = dataSource.getRepository(Inquiry);

  if (await customerRepo.count() === 0) {
    const customers = [
      { name: '华东物流集团', code: 'CUST-001', shortName: '华东物流', type: 'direct', industry: '物流仓储', region: '华东', level: 'A', source: '展会' },
      { name: '南京仓储设备有限公司', code: 'CUST-002', shortName: '南京仓储', type: 'agent', industry: '仓储设备', region: '华东', level: 'B', source: '老客户' },
      { name: '苏州恒达货架厂', code: 'CUST-003', shortName: '苏州恒达', type: 'distributor', industry: '制造业', region: '华东', level: 'A', source: '线上' },
      { name: '深圳前海供应链有限公司', code: 'CUST-004', shortName: '前海供应链', type: 'direct', industry: '供应链', region: '华南', level: 'B', source: '转介绍' },
      { name: '成都天府仓储中心', code: 'CUST-005', shortName: '天府仓储', type: 'direct', industry: '物流仓储', region: '西南', level: 'C', source: '线上' },
      { name: '北京京东供应链基地', code: 'CUST-006', shortName: '京东基地', type: 'direct', industry: '电商物流', region: '华北', level: 'A', source: '展会' },
    ];

    const savedCustomers: Customer[] = [];
    for (const c of customers) {
      const entity = customerRepo.create({ ...c, createdBy: adminId, updatedBy: adminId });
      savedCustomers.push(await customerRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedCustomers.length} 个客户`);

    // 联系人
    const contactsData = [
      { customerId: savedCustomers[0].id, name: '张经理', position: '采购总监', phone: '13800138001', email: 'zhang@hdwl.com', isPrimary: true },
      { customerId: savedCustomers[0].id, name: '王助理', position: '采购专员', phone: '13800138002', email: 'wang@hdwl.com' },
      { customerId: savedCustomers[1].id, name: '李总', position: '总经理', phone: '13900139001', email: 'li@njcc.com', isPrimary: true },
      { customerId: savedCustomers[2].id, name: '赵主管', position: '技术部经理', phone: '13700137001', email: 'zhao@szhd.com', isPrimary: true },
      { customerId: savedCustomers[3].id, name: '刘采购', position: '供应链经理', phone: '13600136001', email: 'liu@qhsc.com', isPrimary: true },
      { customerId: savedCustomers[5].id, name: '陈总监', position: '仓储规划总监', phone: '13500135001', email: 'chen@jd.com', isPrimary: true },
    ];
    for (const ct of contactsData) {
      await contactRepo.save(contactRepo.create({ ...ct, remark: '', createdBy: adminId, updatedBy: adminId }));
    }
    console.log(`  ✅ 创建 ${contactsData.length} 个联系人`);

    // 商机
    const opportunities = [
      { customerId: savedCustomers[0].id, customerName: '华东物流集团', title: '5层横梁式货架采购', amount: 1200000, stage: 'negotiation', probability: 0.7, expectedDate: '2026-08-15' },
      { customerId: savedCustomers[2].id, customerName: '苏州恒达货架厂', title: '贯通式货架批量定制', amount: 850000, stage: 'proposal', probability: 0.5, expectedDate: '2026-09-01' },
      { customerId: savedCustomers[5].id, customerName: '北京京东供应链基地', title: '自动化立体库配套货架', amount: 3500000, stage: 'qualification', probability: 0.3, expectedDate: '2026-10-30' },
      { customerId: savedCustomers[3].id, customerName: '深圳前海供应链有限公司', title: '轻中型货架替换项目', amount: 420000, stage: 'closed_won', probability: 1, expectedDate: '2026-06-01' },
    ];
    const savedOpps: Opportunity[] = [];
    for (const opp of opportunities) {
      const entity = opportunityRepo.create({ ...opp, description: '', createdBy: adminId, updatedBy: adminId });
      savedOpps.push(await opportunityRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedOpps.length} 个商机`);

    // 询价
    const inquiries = [
      { code: 'INQ-2026-001', customerId: savedCustomers[0].id, customerName: '华东物流集团', opportunityId: savedOpps[0].id, shelfType: '横梁式货架', requirement: '5层横梁式货架，高度6m，长度2.7m，深度1m，承重500kg/层', quantity: 500, unit: '组', deliveryDate: '2026-08-10', status: 'quoted' },
      { code: 'INQ-2026-002', customerId: savedCustomers[2].id, customerName: '苏州恒达货架厂', opportunityId: savedOpps[1].id, shelfType: '贯通式货架', requirement: '贯通式货架，高度10m，深度1.2m，承重1000kg/层', quantity: 200, unit: '组', deliveryDate: '2026-08-25', status: 'quoted' },
      { code: 'INQ-2026-003', customerId: savedCustomers[5].id, customerName: '北京京东供应链基地', shelfType: '立体库货架', requirement: '自动化立体库配套货架，高度20m，承重1500kg/层', quantity: 50, unit: '列', status: 'draft' },
    ];
    for (const inq of inquiries) {
      await inquiryRepo.save(inquiryRepo.create({ ...inq, createdBy: adminId, updatedBy: adminId }));
    }
    console.log(`  ✅ 创建 ${inquiries.length} 个询价`);
  }

  // ─── M04 货架类型 ───
  const shelfTypeRepo = dataSource.getRepository(ShelfType);
  const specRepo = dataSource.getRepository(Specification);

  if (await shelfTypeRepo.count() === 0) {
    const shelfTypes: Partial<ShelfType>[] = [
      {
        name: '横梁式货架（选择性货架）', code: 'SHELF-BEAM', category: '重型货架',
        description: '最常见的仓储货架类型，适用于各种仓储场景，存取灵活',
        parameterTemplate: [
          { key: 'height', label: '高度', type: 'number' as const, unit: 'mm', required: true, min: 1500, max: 12000 },
          { key: 'length', label: '长度', type: 'number' as const, unit: 'mm', required: true, min: 500, max: 3000 },
          { key: 'depth', label: '深度', type: 'number' as const, unit: 'mm', required: true, min: 300, max: 1500 },
          { key: 'layers', label: '层数', type: 'number' as const, unit: '层', required: true, min: 2, max: 8 },
          { key: 'loadPerLayer', label: '层载重', type: 'number' as const, unit: 'kg', required: true, min: 100, max: 5000 },
          { key: 'color', label: '颜色', type: 'select' as const, options: ['橙色', '蓝色', '灰色'], defaultValue: '橙色' },
        ] as ParameterDef[],
      },
      {
        name: '贯通式货架（驶入式货架）', code: 'SHELF-DRIVE', category: '重型货架',
        description: '高密度存储货架，叉车可直接驶入货架内部存取货物',
        parameterTemplate: [
          { key: 'height', label: '高度', type: 'number' as const, unit: 'mm', required: true, min: 2000, max: 10000 },
          { key: 'depth', label: '深度', type: 'number' as const, unit: 'mm', required: true, min: 800, max: 1500 },
          { key: 'lanes', label: '贯通深度', type: 'number' as const, unit: '组', required: true, min: 2, max: 10 },
          { key: 'layers', label: '层数', type: 'number' as const, unit: '层', required: true, min: 2, max: 6 },
          { key: 'loadPerLayer', label: '层载重', type: 'number' as const, unit: 'kg', required: true, min: 500, max: 3000 },
        ] as ParameterDef[],
      },
      {
        name: '轻中型货架', code: 'SHELF-LIGHT', category: '轻型货架',
        description: '适用于人工存取的轻型货物存储，常用于办公室、小店等',
        parameterTemplate: [
          { key: 'height', label: '高度', type: 'number' as const, unit: 'mm', required: true, min: 1000, max: 3000 },
          { key: 'length', label: '长度', type: 'number' as const, unit: 'mm', required: true, min: 400, max: 1500 },
          { key: 'depth', label: '深度', type: 'number' as const, unit: 'mm', required: true, min: 300, max: 600 },
          { key: 'layers', label: '层数', type: 'number' as const, unit: '层', required: true, min: 3, max: 7 },
          { key: 'loadPerLayer', label: '层载重', type: 'number' as const, unit: 'kg', required: true, min: 50, max: 500 },
        ] as ParameterDef[],
      },
      {
        name: '悬臂式货架', code: 'SHELF-CANTILEVER', category: '特殊货架',
        description: '适用于长条形物料存储，如管材、板材、型材等',
        parameterTemplate: [
          { key: 'height', label: '高度', type: 'number' as const, unit: 'mm', required: true, min: 1500, max: 6000 },
          { key: 'armLength', label: '悬臂长度', type: 'number' as const, unit: 'mm', required: true, min: 200, max: 1500 },
          { key: 'armsPerSide', label: '每侧臂数', type: 'number' as const, unit: '根', required: true, min: 2, max: 8 },
          { key: 'loadPerArm', label: '臂载重', type: 'number' as const, unit: 'kg', required: true, min: 50, max: 1000 },
          { key: 'sides', label: '单/双侧', type: 'select' as const, options: ['单侧', '双侧'], defaultValue: '双侧' },
        ] as ParameterDef[],
      },
    ];

    const savedTypes: ShelfType[] = [];
    for (const st of shelfTypes) {
      const entity = shelfTypeRepo.create({ ...st, status: 'active', createdBy: adminId, updatedBy: adminId } as Partial<ShelfType>);
      savedTypes.push(await shelfTypeRepo.save(entity as ShelfType));
    }
    console.log(`  ✅ 创建 ${savedTypes.length} 个货架类型`);

    // 规格（横梁式货架的核心规格）
    const specs = [
      {
        shelfTypeId: savedTypes[0].id,
        name: '标准横梁式货架规格',
        parameterConstraints: {
          height: { min: 1500, max: 12000 },
          length: { min: 500, max: 3000 },
          depth: { min: 300, max: 1500 },
        },
        structureTemplate: [
          { partCode: 'UP-BEAM', partName: '横梁', material: 'Q235B', quantityFormula: 'layers * 2', lengthFormula: 'length', unit: 'mm', wasteRate: 0.03, category: 'beam' },
          { partCode: 'UP-COLUMN', partName: '立柱', material: 'Q235B', quantityFormula: '2', lengthFormula: 'height', unit: 'mm', wasteRate: 0.02, category: 'column' },
          { partCode: 'UP-LAYER-PANEL', partName: '层板', material: 'Q235B', quantityFormula: 'layers', lengthFormula: 'length', unit: 'mm', wasteRate: 0.05, category: 'panel' },
          { partCode: 'UP-BRACE', partName: '横撑', material: 'Q235', quantityFormula: '4', lengthFormula: 'depth', unit: 'mm', wasteRate: 0.02, category: 'brace' },
          { partCode: 'UP-DIAG', partName: '斜撑', material: 'Q235', quantityFormula: '6', lengthFormula: 'sqrt(height*height + depth*depth)', unit: 'mm', wasteRate: 0.03, category: 'brace' },
        ],
      },
      {
        shelfTypeId: savedTypes[1].id,
        name: '贯通式货架规格',
        parameterConstraints: {
          height: { min: 2000, max: 10000 },
          depth: { min: 800, max: 1500 },
        },
        structureTemplate: [
          { partCode: 'DI-COLUMN', partName: '立柱', material: 'Q345', quantityFormula: '2 * lanes', lengthFormula: 'height', unit: 'mm', wasteRate: 0.02, category: 'column' },
          { partCode: 'DI-BRACE', partName: '横撑', material: 'Q235', quantityFormula: '4 * lanes', lengthFormula: 'depth', unit: 'mm', wasteRate: 0.03, category: 'brace' },
          { partCode: 'DI-RAIL', partName: '导轨梁', material: 'Q235B', quantityFormula: 'layers * 2', lengthFormula: 'depth * lanes', unit: 'mm', wasteRate: 0.05, category: 'beam' },
        ],
      },
    ];
    for (const sp of specs) {
      await specRepo.save(specRepo.create({ ...sp, createdBy: adminId, updatedBy: adminId }));
    }
    console.log(`  ✅ 创建 ${specs.length} 个规格模板`);
  }

  // ─── M06 合同 ───
  const contractRepo = dataSource.getRepository(Contract);
  if (await contractRepo.count() === 0) {
    const customersInDb = await customerRepo.find();
    const contracts = [
      { code: 'CON-2026-001', customerId: customersInDb[3]?.id, customerName: '深圳前海供应链有限公司', title: '轻中型货架采购合同', amount: 420000, signDate: '2026-06-05', deliveryDate: '2026-07-15', paymentTerms: '30%预付+70%发货前', status: 'executing' as ContractStatus },
      { code: 'CON-2026-002', customerId: customersInDb[0]?.id, customerName: '华东物流集团', title: '横梁式货架采购意向', amount: 1200000, status: 'reviewing' as ContractStatus },
    ];
    for (const ct of contracts) {
      await contractRepo.save(contractRepo.create({ ...ct, terms: '', createdBy: adminId, updatedBy: adminId }));
    }
    console.log(`  ✅ 创建 ${contracts.length} 个合同`);
  }

  // ─── M07 项目 ───
  const projectRepo = dataSource.getRepository(Project);
  if (await projectRepo.count() === 0) {
    const customersInDb = await customerRepo.find();
    const contractsInDb = await contractRepo.find();
    const projects = [
      { code: 'PRJ-2026-001', name: '前海供应链轻中型货架交付项目', contractId: contractsInDb[0]?.id, customerId: customersInDb[3]?.id, customerName: '深圳前海供应链有限公司', managerId: adminId, managerName: '系统管理员', startDate: '2026-06-10', endDate: '2026-07-20', progress: 30, status: 'in_progress' as ProjectStatus, description: '按合同交付200组轻中型货架' },
      { code: 'PRJ-2026-002', name: '华东物流横梁式货架规划', customerId: customersInDb[0]?.id, customerName: '华东物流集团', managerId: adminId, managerName: '系统管理员', startDate: '2026-07-01', endDate: '2026-09-30', progress: 10, status: 'planning' as ProjectStatus, description: '横梁式货架项目前期规划' },
    ];
    for (const pj of projects) {
      await projectRepo.save(projectRepo.create({ ...pj, createdBy: adminId, updatedBy: adminId }));
    }
    console.log(`  ✅ 创建 ${projects.length} 个项目`);
  }

  // ─── M05 报价管理 ───
  const currencyRepo = dataSource.getRepository(Currency);
  const quotationRepo = dataSource.getRepository(Quotation);
  const costItemRepo = dataSource.getRepository(CostItem);
  const versionRepo = dataSource.getRepository(QuotationVersion);

  // 币种
  let cnyCurrency: Currency | null = null;
  if (await currencyRepo.count() === 0) {
    const currencies = [
      { code: 'CNY', name: '人民币', symbol: '¥', rate: 1.0 },
      { code: 'USD', name: '美元', symbol: '$', rate: 7.25 },
      { code: 'EUR', name: '欧元', symbol: '€', rate: 7.85 },
    ];
    const saved: Currency[] = [];
    for (const c of currencies) {
      saved.push(await currencyRepo.save(currencyRepo.create(c)));
    }
    cnyCurrency = saved[0];
    console.log(`  ✅ 创建 ${saved.length} 个币种`);
  } else {
    cnyCurrency = await currencyRepo.findOne({ where: { code: 'CNY' } });
  }

  // 报价单
  if (await quotationRepo.count() === 0) {
    const customersInDb = await customerRepo.find();
    const shelfTypesInDb = await shelfTypeRepo.find();
    const inquiriesInDb = await inquiryRepo.find();
    const currencyId = cnyCurrency?.id || null;

    const quotations = [
      {
        code: 'QUO-2026-001',
        inquiryId: inquiriesInDb[0]?.id || null,
        customerId: customersInDb[0]?.id,
        customerName: '华东物流集团',
        shelfTypeId: shelfTypesInDb[0]?.id || null,
        shelfTypeName: '横梁式货架（选择性货架）',
        configName: '5层横梁式 H6000×L2700×D1000 承重500kg',
        quantity: 500,
        unitPrice: 1850,
        totalPrice: 925000,
        currencyId,
        exchangeRate: 1.0,
        margin: 0.22,
        deliveryDays: 30,
        validUntil: '2026-08-31',
        version: 2,
        status: 'sent' as QuotationStatus,
        remark: '含运输安装，不含地基施工',
      },
      {
        code: 'QUO-2026-002',
        inquiryId: inquiriesInDb[1]?.id || null,
        customerId: customersInDb[2]?.id,
        customerName: '苏州恒达货架厂',
        shelfTypeId: shelfTypesInDb[1]?.id || null,
        shelfTypeName: '贯通式货架（驶入式货架）',
        configName: '贯通式 H10000×D1200 承重1000kg',
        quantity: 200,
        unitPrice: 3200,
        totalPrice: 640000,
        currencyId,
        exchangeRate: 1.0,
        margin: 0.18,
        deliveryDays: 45,
        validUntil: '2026-09-15',
        version: 1,
        status: 'pending_review' as QuotationStatus,
        remark: '高密度存储方案',
      },
      {
        code: 'QUO-2026-003',
        customerId: customersInDb[3]?.id,
        customerName: '深圳前海供应链有限公司',
        shelfTypeId: shelfTypesInDb[2]?.id || null,
        shelfTypeName: '轻中型货架',
        configName: '4层轻中型 H2000×L1500×D500 承重200kg',
        quantity: 200,
        unitPrice: 680,
        totalPrice: 136000,
        currencyId,
        exchangeRate: 1.0,
        margin: 0.25,
        deliveryDays: 20,
        validUntil: '2026-07-31',
        version: 1,
        status: 'accepted' as QuotationStatus,
        remark: '已转为合同 CON-2026-001',
      },
      {
        code: 'QUO-2026-004',
        customerId: customersInDb[5]?.id,
        customerName: '北京京东供应链基地',
        shelfTypeId: shelfTypesInDb[0]?.id || null,
        shelfTypeName: '横梁式货架（选择性货架）',
        configName: '立体库配套 H12000×L2700×D1100 承重1500kg',
        quantity: 50,
        unitPrice: 8500,
        totalPrice: 425000,
        currencyId,
        exchangeRate: 1.0,
        margin: 0.15,
        deliveryDays: 60,
        validUntil: '2026-10-31',
        version: 1,
        status: 'draft' as QuotationStatus,
        remark: '自动化立体库配套方案',
      },
    ];

    const savedQuotations: Quotation[] = [];
    for (const q of quotations) {
      const entity = quotationRepo.create({ ...q, configId: null, createdBy: adminId, updatedBy: adminId });
      savedQuotations.push(await quotationRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedQuotations.length} 个报价单`);

    // 成本项
    const costItemsData = [
      // QUO-001 成本
      { quotationId: savedQuotations[0].id, category: 'material' as const, name: '立柱钢材 Q235B', amount: 280000, unit: 'kg', remark: '2根/组×500组', sortOrder: 1 },
      { quotationId: savedQuotations[0].id, category: 'material' as const, name: '横梁钢材 Q235B', amount: 195000, unit: 'kg', remark: '10根/组×500组', sortOrder: 2 },
      { quotationId: savedQuotations[0].id, category: 'material' as const, name: '层板钢材 Q235B', amount: 120000, unit: 'kg', remark: '5层×500组', sortOrder: 3 },
      { quotationId: savedQuotations[0].id, category: 'labor' as const, name: '焊接人工', amount: 85000, unit: '工时', remark: '焊接+组装', sortOrder: 4 },
      { quotationId: savedQuotations[0].id, category: 'logistics' as const, name: '运输费', amount: 35000, unit: '趟', remark: '华东地区', sortOrder: 5 },
      { quotationId: savedQuotations[0].id, category: 'overhead' as const, name: '管理费用', amount: 42000, unit: '元', remark: '5%管理费', sortOrder: 6 },
      // QUO-002 成本
      { quotationId: savedQuotations[1].id, category: 'material' as const, name: '立柱钢材 Q345', amount: 220000, unit: 'kg', remark: '高强钢', sortOrder: 1 },
      { quotationId: savedQuotations[1].id, category: 'material' as const, name: '导轨梁 Q235B', amount: 95000, unit: 'kg', remark: '导轨系统', sortOrder: 2 },
      { quotationId: savedQuotations[1].id, category: 'labor' as const, name: '焊接人工', amount: 65000, unit: '工时', remark: '贯通式特殊焊接', sortOrder: 3 },
      { quotationId: savedQuotations[1].id, category: 'outsourcing' as const, name: '表面处理外包', amount: 48000, unit: 'm2', remark: '喷塑外包', sortOrder: 4 },
      // QUO-003 成本
      { quotationId: savedQuotations[2].id, category: 'material' as const, name: '轻型型材', amount: 52000, unit: 'kg', remark: '轻中型货架型材', sortOrder: 1 },
      { quotationId: savedQuotations[2].id, category: 'labor' as const, name: '组装人工', amount: 18000, unit: '工时', remark: '人工组装', sortOrder: 2 },
      { quotationId: savedQuotations[2].id, category: 'logistics' as const, name: '运输费', amount: 12000, unit: '趟', remark: '华南地区', sortOrder: 3 },
    ];
    for (const ci of costItemsData) {
      await costItemRepo.save(costItemRepo.create(ci));
    }
    console.log(`  ✅ 创建 ${costItemsData.length} 个成本项`);

    // 报价版本
    const versionsData = [
      { quotationId: savedQuotations[0].id, version: 1, unitPrice: 1950, totalPrice: 975000, margin: 0.26, changedFields: ['unitPrice', 'totalPrice', 'margin'], remark: '初始报价', createdBy: adminId },
      { quotationId: savedQuotations[0].id, version: 2, unitPrice: 1850, totalPrice: 925000, margin: 0.22, changedFields: ['unitPrice', 'totalPrice', 'margin'], remark: '客户议价后下调', createdBy: adminId },
    ];
    for (const v of versionsData) {
      await versionRepo.save(versionRepo.create(v));
    }
    console.log(`  ✅ 创建 ${versionsData.length} 个报价版本`);
  }

  // ─── M08 采购管理 ───
  const purchaseOrderRepo = dataSource.getRepository(PurchaseOrder);
  const purchaseItemRepo = dataSource.getRepository(PurchaseItem);

  if (await purchaseOrderRepo.count() === 0) {
    const projectsInDb = await projectRepo.find();
    const customersInDb = await customerRepo.find();

    const purchaseOrders = [
      {
        code: 'PO-2026-001',
        projectId: projectsInDb[0]?.id || null,
        supplierName: '南京钢铁贸易有限公司',
        contactName: '周经理',
        contactPhone: '13912345678',
        orderDate: '2026-06-12',
        expectedDate: '2026-06-28',
        amount: 380000,
        status: 'ordered' as PurchaseStatus,
        remark: '横梁式货架钢材采购，含Q235B型材',
      },
      {
        code: 'PO-2026-002',
        projectId: projectsInDb[0]?.id || null,
        supplierName: '苏州五金标准件有限公司',
        contactName: '吴总',
        contactPhone: '13856789012',
        orderDate: '2026-06-15',
        expectedDate: '2026-07-01',
        amount: 45000,
        status: 'partial_received' as PurchaseStatus,
        remark: '螺栓、螺母、销钉等标准件',
      },
      {
        code: 'PO-2026-003',
        projectId: projectsInDb[1]?.id || null,
        supplierName: '上海喷塑加工厂',
        contactName: '孙厂长',
        contactPhone: '13787654321',
        orderDate: '2026-06-18',
        expectedDate: '2026-07-10',
        amount: 28000,
        status: 'draft' as PurchaseStatus,
        remark: '货架表面喷塑处理',
      },
      {
        code: 'PO-2026-004',
        supplierName: '常州物流包装材料厂',
        contactName: '钱经理',
        contactPhone: '13611112222',
        orderDate: '2026-06-20',
        expectedDate: '2026-07-05',
        amount: 12000,
        status: 'received' as PurchaseStatus,
        remark: '包装材料及保护角',
      },
    ];

    const savedPOs: PurchaseOrder[] = [];
    for (const po of purchaseOrders) {
      const entity = purchaseOrderRepo.create({ ...po, supplierId: null, createdBy: adminId, updatedBy: adminId });
      savedPOs.push(await purchaseOrderRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedPOs.length} 个采购订单`);

    // 采购明细
    const poItemsData = [
      // PO-001 钢材
      { purchaseOrderId: savedPOs[0].id, partCode: 'UP-COLUMN', partName: '立柱型材 Q235B', material: 'Q235B', spec: '80×60×2.0mm', quantity: 12000, unit: 'kg', unitPrice: 5.2, totalPrice: 62400, receivedQty: 0, expectedDate: '2026-06-28', remark: '500组×2根', sortOrder: 1 },
      { purchaseOrderId: savedPOs[0].id, partCode: 'UP-BEAM', partName: '横梁型材 Q235B', material: 'Q235B', spec: '100×50×1.8mm', quantity: 18000, unit: 'kg', unitPrice: 5.5, totalPrice: 99000, receivedQty: 0, expectedDate: '2026-06-28', remark: '500组×10根', sortOrder: 2 },
      { purchaseOrderId: savedPOs[0].id, partCode: 'UP-LAYER-PANEL', partName: '层板 Q235B', material: 'Q235B', spec: '2.0mm钢板', quantity: 8500, unit: 'kg', unitPrice: 5.8, totalPrice: 49300, receivedQty: 0, expectedDate: '2026-06-28', remark: '500组×5层', sortOrder: 3 },
      { purchaseOrderId: savedPOs[0].id, partCode: 'UP-BRACE', partName: '横撑 Q235', material: 'Q235', spec: '30×30×1.5mm', quantity: 3200, unit: 'kg', unitPrice: 5.0, totalPrice: 16000, receivedQty: 0, expectedDate: '2026-06-28', remark: '500组×4根', sortOrder: 4 },
      // PO-002 标准件
      { purchaseOrderId: savedPOs[1].id, partCode: 'STD-BOLT-M8', partName: '内六角螺栓 M8×30', material: '8.8级', spec: 'M8×30', quantity: 20000, unit: '个', unitPrice: 0.85, totalPrice: 17000, receivedQty: 20000, expectedDate: '2026-07-01', remark: '横梁连接', sortOrder: 1 },
      { purchaseOrderId: savedPOs[1].id, partCode: 'STD-NUT-M8', partName: '法兰螺母 M8', material: '8.8级', spec: 'M8', quantity: 20000, unit: '个', unitPrice: 0.45, totalPrice: 9000, receivedQty: 20000, expectedDate: '2026-07-01', remark: '配套螺母', sortOrder: 2 },
      { purchaseOrderId: savedPOs[1].id, partCode: 'STD-PIN', partName: '安全销', material: '不锈钢304', spec: 'Φ5×40', quantity: 10000, unit: '个', unitPrice: 0.65, totalPrice: 6500, receivedQty: 5000, expectedDate: '2026-07-01', remark: '安全锁销', sortOrder: 3 },
      { purchaseOrderId: savedPOs[1].id, partCode: 'STD-WASHER', partName: '平垫圈 D8', material: '不锈钢304', spec: 'D8', quantity: 20000, unit: '个', unitPrice: 0.15, totalPrice: 3000, receivedQty: 0, expectedDate: '2026-07-01', remark: '配套垫圈', sortOrder: 4 },
      // PO-003 喷塑
      { purchaseOrderId: savedPOs[2].id, partCode: 'PAINT-ORANGE', partName: '橙色喷塑加工', material: '环氧树脂', spec: 'RAL2008', quantity: 3500, unit: 'm2', unitPrice: 5.5, totalPrice: 19250, expectedDate: '2026-07-10', remark: '立柱+横梁外表面', sortOrder: 1 },
      { purchaseOrderId: savedPOs[2].id, partCode: 'PAINT-BLUE', partName: '蓝色喷塑加工', material: '环氧树脂', spec: 'RAL5015', quantity: 1000, unit: 'm2', unitPrice: 5.5, totalPrice: 5500, expectedDate: '2026-07-10', remark: '层板外表面', sortOrder: 2 },
      // PO-004 包装
      { purchaseOrderId: savedPOs[3].id, partCode: 'PKG-FILM', partName: '拉伸缠绕膜', material: 'PE', spec: '500mm×0.05mm', quantity: 200, unit: '卷', unitPrice: 35, totalPrice: 7000, receivedQty: 200, expectedDate: '2026-07-05', remark: '包装防护', sortOrder: 1 },
      { purchaseOrderId: savedPOs[3].id, partCode: 'PKG-CORNER', partName: '纸护角', material: '纸板', spec: '50×50×5mm', quantity: 2000, unit: '个', unitPrice: 1.5, totalPrice: 3000, receivedQty: 2000, expectedDate: '2026-07-05', remark: '运输保护', sortOrder: 2 },
      { purchaseOrderId: savedPOs[3].id, partCode: 'PKG-BOX', partName: '标准件包装盒', material: '瓦楞纸', spec: '500×350×200mm', quantity: 200, unit: '个', unitPrice: 10, totalPrice: 2000, receivedQty: 200, expectedDate: '2026-07-05', remark: '标准件分装', sortOrder: 3 },
    ];
    for (const pi of poItemsData) {
      await purchaseItemRepo.save(purchaseItemRepo.create(pi));
    }
    console.log(`  ✅ 创建 ${poItemsData.length} 个采购明细`);
  }

  // ─── M10 生产管理（工单+工序） ───
  const workOrderRepo = dataSource.getRepository(WorkOrder);
  const processStepRepo = dataSource.getRepository(ProcessStep);

  if (await workOrderRepo.count() === 0) {
    const projectsInDb = await projectRepo.find();

    const workOrders = [
      {
        code: 'WO-2026-001',
        projectId: projectsInDb[0]?.id || null,
        quantity: 200,
        completedQty: 80,
        priority: 'high' as WorkOrderPriority,
        status: 'in_progress' as WorkOrderStatus,
        plannedStart: '2026-06-15',
        plannedEnd: '2026-07-10',
        actualStart: '2026-06-15',
        remark: '前海供应链轻中型货架200组，已完成80组',
      },
      {
        code: 'WO-2026-002',
        projectId: projectsInDb[0]?.id || null,
        quantity: 200,
        completedQty: 0,
        priority: 'normal' as WorkOrderPriority,
        status: 'released' as WorkOrderStatus,
        plannedStart: '2026-07-01',
        plannedEnd: '2026-07-25',
        remark: '轻中型货架第二批200组',
      },
      {
        code: 'WO-2026-003',
        projectId: projectsInDb[1]?.id || null,
        quantity: 500,
        completedQty: 0,
        priority: 'urgent' as WorkOrderPriority,
        status: 'pending' as WorkOrderStatus,
        plannedStart: '2026-08-01',
        plannedEnd: '2026-09-20',
        remark: '华东物流横梁式货架500组，待排产',
      },
      {
        code: 'WO-2026-004',
        quantity: 50,
        completedQty: 50,
        priority: 'normal' as WorkOrderPriority,
        status: 'completed' as WorkOrderStatus,
        plannedStart: '2026-05-20',
        plannedEnd: '2026-06-10',
        actualStart: '2026-05-20',
        actualEnd: '2026-06-08',
        remark: '样品工单，已完成交付',
      },
    ];

    const savedWOs: WorkOrder[] = [];
    for (const wo of workOrders) {
      const entity = workOrderRepo.create({ ...wo, bomId: null, shelfConfigId: null, createdBy: adminId, updatedBy: adminId });
      savedWOs.push(await workOrderRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedWOs.length} 个工单`);

    // 工序
    const stepsData = [
      // WO-001 工序（进行中，前3步完成）
      { workOrderId: savedWOs[0].id, stepCode: 'CUT', stepName: '切割下料', sequence: 1, equipmentName: '激光切割机-01', plannedMinutes: 480, actualMinutes: 460, status: 'completed' as ProcessStepStatus, operatorName: '王师傅', startedAt: '2026-06-15T08:00:00', completedAt: '2026-06-15T16:00:00', remark: '200组型材切割完成' },
      { workOrderId: savedWOs[0].id, stepCode: 'PUNCH', stepName: '冲孔', sequence: 2, equipmentName: '冲床-03', plannedMinutes: 360, actualMinutes: 340, status: 'completed' as ProcessStepStatus, operatorName: '李师傅', startedAt: '2026-06-16T08:00:00', completedAt: '2026-06-16T14:00:00', remark: '立柱冲孔完成' },
      { workOrderId: savedWOs[0].id, stepCode: 'WELD', stepName: '焊接', sequence: 3, equipmentName: '焊接机器人-02', plannedMinutes: 720, actualMinutes: 680, status: 'completed' as ProcessStepStatus, operatorName: '赵师傅', startedAt: '2026-06-17T08:00:00', completedAt: '2026-06-18T10:00:00', remark: '80组焊接完成' },
      { workOrderId: savedWOs[0].id, stepCode: 'PAINT', stepName: '表面处理', sequence: 4, equipmentName: '喷塑线-01', plannedMinutes: 600, actualMinutes: null, status: 'in_progress' as ProcessStepStatus, operatorName: '钱师傅', startedAt: '2026-06-20T08:00:00', completedAt: null, remark: '正在喷塑处理' },
      { workOrderId: savedWOs[0].id, stepCode: 'ASSY', stepName: '组装', sequence: 5, equipmentName: '组装线-A', plannedMinutes: 480, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '等待喷塑完成' },
      { workOrderId: savedWOs[0].id, stepCode: 'PACK', stepName: '包装入库', sequence: 6, equipmentName: '包装组', plannedMinutes: 240, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '' },
      // WO-003 工序（待排产，全部 pending）
      { workOrderId: savedWOs[2].id, stepCode: 'CUT', stepName: '切割下料', sequence: 1, equipmentName: '激光切割机-01', plannedMinutes: 1200, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '500组型材' },
      { workOrderId: savedWOs[2].id, stepCode: 'PUNCH', stepName: '冲孔', sequence: 2, equipmentName: '冲床-03', plannedMinutes: 900, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '' },
      { workOrderId: savedWOs[2].id, stepCode: 'WELD', stepName: '焊接', sequence: 3, equipmentName: '焊接机器人-01', plannedMinutes: 1800, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '500组焊接' },
      { workOrderId: savedWOs[2].id, stepCode: 'PAINT', stepName: '表面处理', sequence: 4, equipmentName: '喷塑线-01', plannedMinutes: 1500, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '' },
      { workOrderId: savedWOs[2].id, stepCode: 'ASSY', stepName: '组装', sequence: 5, equipmentName: '组装线-A', plannedMinutes: 1200, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '' },
      { workOrderId: savedWOs[2].id, stepCode: 'PACK', stepName: '包装入库', sequence: 6, equipmentName: '包装组', plannedMinutes: 600, actualMinutes: null, status: 'pending' as ProcessStepStatus, operatorName: null, startedAt: null, completedAt: null, remark: '' },
      // WO-004 工序（全部完成）
      { workOrderId: savedWOs[3].id, stepCode: 'CUT', stepName: '切割下料', sequence: 1, equipmentName: '激光切割机-02', plannedMinutes: 120, actualMinutes: 110, status: 'completed' as ProcessStepStatus, operatorName: '王师傅', startedAt: '2026-05-20T08:00:00', completedAt: '2026-05-20T10:00:00', remark: '' },
      { workOrderId: savedWOs[3].id, stepCode: 'WELD', stepName: '焊接', sequence: 2, equipmentName: '焊接机器人-02', plannedMinutes: 240, actualMinutes: 220, status: 'completed' as ProcessStepStatus, operatorName: '赵师傅', startedAt: '2026-05-20T13:00:00', completedAt: '2026-05-21T09:00:00', remark: '' },
      { workOrderId: savedWOs[3].id, stepCode: 'ASSY', stepName: '组装', sequence: 3, equipmentName: '组装线-B', plannedMinutes: 180, actualMinutes: 170, status: 'completed' as ProcessStepStatus, operatorName: '孙师傅', startedAt: '2026-05-21T13:00:00', completedAt: '2026-05-22T09:00:00', remark: '' },
    ];
    for (const ps of stepsData) {
      await processStepRepo.save(processStepRepo.create(ps as any));
    }
    console.log(`  ✅ 创建 ${stepsData.length} 个工序步骤`);
  }

  // ─── M11 仓储管理 ───
  const warehouseRepo = dataSource.getRepository(Warehouse);
  const inventoryRepo = dataSource.getRepository(Inventory);
  const invTxRepo = dataSource.getRepository(InventoryTransaction);

  if (await warehouseRepo.count() === 0) {
    const warehouses = [
      { name: '原材料仓', code: 'WH-RAW', location: '厂区A栋1楼东侧', type: '原材料仓', managerName: '陈仓管', status: 'active', remark: '存放钢材、型材等原材料' },
      { name: '半成品仓', code: 'WH-WIP', location: '厂区A栋2楼', type: '半成品仓', managerName: '林仓管', status: 'active', remark: '存放焊接后未喷塑的半成品' },
      { name: '成品仓', code: 'WH-FG', location: '厂区B栋1楼', type: '成品仓', managerName: '黄仓管', status: 'active', remark: '存放已完成待发货的成品' },
      { name: '标准件仓', code: 'WH-STD', location: '厂区A栋1楼西侧', type: '配件仓', managerName: '陈仓管', status: 'active', remark: '存放螺栓、螺母等标准件' },
      { name: '包装材料仓', code: 'WH-PKG', location: '厂区B栋2楼', type: '辅料仓', managerName: '吴仓管', status: 'active', remark: '存放包装材料' },
    ];
    const savedWHs: Warehouse[] = [];
    for (const wh of warehouses) {
      const entity = warehouseRepo.create({ ...wh, createdBy: adminId, updatedBy: adminId });
      savedWHs.push(await warehouseRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedWHs.length} 个仓库`);

    // 库存
    const inventoryData = [
      { warehouseId: savedWHs[0].id, partCode: 'RAW-Q235B-COLUMN', partName: '立柱型材 Q235B', material: 'Q235B', spec: '80×60×2.0mm', unit: 'kg', quantity: 6500, safetyStock: 3000, batchNo: 'BATCH-2026-06-A' },
      { warehouseId: savedWHs[0].id, partCode: 'RAW-Q235B-BEAM', partName: '横梁型材 Q235B', material: 'Q235B', spec: '100×50×1.8mm', unit: 'kg', quantity: 4200, safetyStock: 5000, batchNo: 'BATCH-2026-06-A' },
      { warehouseId: savedWHs[0].id, partCode: 'RAW-Q235B-PANEL', partName: '层板钢材 Q235B', material: 'Q235B', spec: '2.0mm钢板', unit: 'kg', quantity: 2800, safetyStock: 2000, batchNo: 'BATCH-2026-06-B' },
      { warehouseId: savedWHs[0].id, partCode: 'RAW-Q345-COLUMN', partName: '立柱型材 Q345', material: 'Q345', spec: '90×65×2.5mm', unit: 'kg', quantity: 1500, safetyStock: 1000, batchNo: 'BATCH-2026-05-C' },
      { warehouseId: savedWHs[1].id, partCode: 'WIP-BEAM-001', partName: '横梁焊接件（未喷塑）', material: 'Q235B', spec: 'L2700mm', unit: '根', quantity: 320, safetyStock: 100, batchNo: 'WIP-2026-06-15' },
      { warehouseId: savedWHs[1].id, partCode: 'WIP-COLUMN-001', partName: '立柱焊接件（未喷塑）', material: 'Q235B', spec: 'H6000mm', unit: '根', quantity: 160, safetyStock: 80, batchNo: 'WIP-2026-06-15' },
      { warehouseId: savedWHs[2].id, partCode: 'FG-SHELF-LIGHT', partName: '轻中型货架成品', material: 'Q235B', spec: '4层 H2000×L1500×D500', unit: '组', quantity: 80, safetyStock: 50, batchNo: 'FG-2026-06-001' },
      { warehouseId: savedWHs[2].id, partCode: 'FG-SHELF-BEAM', partName: '横梁式货架成品', material: 'Q235B', spec: '5层 H6000×L2700×D1000', unit: '组', quantity: 0, safetyStock: 30, batchNo: null },
      { warehouseId: savedWHs[3].id, partCode: 'STD-BOLT-M8', partName: '内六角螺栓 M8×30', material: '8.8级', spec: 'M8×30', unit: '个', quantity: 35000, safetyStock: 10000, batchNo: 'STD-2026-06-A' },
      { warehouseId: savedWHs[3].id, partCode: 'STD-NUT-M8', partName: '法兰螺母 M8', material: '8.8级', spec: 'M8', unit: '个', quantity: 28000, safetyStock: 10000, batchNo: 'STD-2026-06-A' },
      { warehouseId: savedWHs[3].id, partCode: 'STD-PIN', partName: '安全销', material: '不锈钢304', spec: 'Φ5×40', unit: '个', quantity: 8000, safetyStock: 5000, batchNo: 'STD-2026-06-B' },
      { warehouseId: savedWHs[3].id, partCode: 'STD-WASHER', partName: '平垫圈 D8', material: '不锈钢304', spec: 'D8', unit: '个', quantity: 2000, safetyStock: 8000, batchNo: 'STD-2026-06-B' },
      { warehouseId: savedWHs[4].id, partCode: 'PKG-FILM', partName: '拉伸缠绕膜', material: 'PE', spec: '500mm×0.05mm', unit: '卷', quantity: 180, safetyStock: 50, batchNo: 'PKG-2026-06' },
      { warehouseId: savedWHs[4].id, partCode: 'PKG-CORNER', partName: '纸护角', material: '纸板', spec: '50×50×5mm', unit: '个', quantity: 1500, safetyStock: 500, batchNo: 'PKG-2026-06' },
    ];
    const savedInvs: Inventory[] = [];
    for (const inv of inventoryData) {
      const entity = inventoryRepo.create({ ...inv, createdBy: adminId, updatedBy: adminId } as any);
      const saved = await inventoryRepo.save(entity) as unknown as Inventory;
      savedInvs.push(saved);
    }
    console.log(`  ✅ 创建 ${savedInvs.length} 条库存记录`);

    // 库存流水
    const txData = [
      { inventoryId: savedInvs[0].id, warehouseId: savedInvs[0].id, type: 'in' as const, quantity: 12000, beforeQty: 0, afterQty: 12000, referenceNo: 'PO-2026-001', remark: '采购入库 12000kg', createdBy: adminId },
      { inventoryId: savedInvs[0].id, warehouseId: savedInvs[0].id, type: 'out' as const, quantity: 5500, beforeQty: 12000, afterQty: 6500, referenceNo: 'WO-2026-001', remark: '生产领料 5500kg', createdBy: adminId },
      { inventoryId: savedInvs[1].id, warehouseId: savedInvs[0].id, type: 'in' as const, quantity: 18000, beforeQty: 0, afterQty: 18000, referenceNo: 'PO-2026-001', remark: '采购入库 18000kg', createdBy: adminId },
      { inventoryId: savedInvs[1].id, warehouseId: savedInvs[0].id, type: 'out' as const, quantity: 13800, beforeQty: 18000, afterQty: 4200, referenceNo: 'WO-2026-001', remark: '生产领料 13800kg', createdBy: adminId },
      { inventoryId: savedInvs[8].id, warehouseId: savedInvs[3].id, type: 'in' as const, quantity: 20000, beforeQty: 0, afterQty: 20000, referenceNo: 'PO-2026-002', remark: '采购入库 20000个', createdBy: adminId },
      { inventoryId: savedInvs[8].id, warehouseId: savedInvs[3].id, type: 'out' as const, quantity: 15000, beforeQty: 20000, afterQty: 5000, referenceNo: 'WO-2026-001', remark: '生产领用 15000个', createdBy: adminId },
      { inventoryId: savedInvs[8].id, warehouseId: savedInvs[3].id, type: 'in' as const, quantity: 30000, beforeQty: 5000, afterQty: 35000, referenceNo: 'PO-2026-002-SUPP', remark: '补充采购 30000个', createdBy: adminId },
      { inventoryId: savedInvs[6].id, warehouseId: savedWHs[2].id, type: 'in' as const, quantity: 80, beforeQty: 0, afterQty: 80, referenceNo: 'WO-2026-001', remark: '成品入库 80组', createdBy: adminId },
      { inventoryId: savedInvs[11].id, warehouseId: savedInvs[3].id, type: 'in' as const, quantity: 2000, beforeQty: 0, afterQty: 2000, referenceNo: 'PO-2026-002', remark: '采购入库 2000个', createdBy: adminId },
      { inventoryId: savedInvs[11].id, warehouseId: savedInvs[3].id, type: 'adjust' as const, quantity: 0, beforeQty: 2000, afterQty: 2000, referenceNo: 'ADJ-001', remark: '库存盘点调整', createdBy: adminId },
    ];
    for (const tx of txData) {
      await invTxRepo.save(invTxRepo.create(tx as any));
    }
    console.log(`  ✅ 创建 ${txData.length} 条库存流水`);
  }

  // ─── M12 成本核算 ───
  const costDimensionRepo = dataSource.getRepository(CostDimension);
  const costAlertRepo = dataSource.getRepository(CostAlert);

  if (await costDimensionRepo.count() === 0) {
    const projectsInDb = await projectRepo.find();
    const quotationsInDb = await quotationRepo.find();

    const costDimensions = [
      // 项目1 成本维度
      { projectId: projectsInDb[0]?.id || null, quotationId: null, type: 'material' as CostDimensionType, name: '原材料成本', budgetAmount: 280000, actualAmount: 265000, varianceAmount: -15000, varianceRate: -0.0536, remark: '钢材采购价格低于预算' },
      { projectId: projectsInDb[0]?.id || null, quotationId: null, type: 'labor' as CostDimensionType, name: '人工成本', budgetAmount: 85000, actualAmount: 92000, varianceAmount: 7000, varianceRate: 0.0824, remark: '加班导致人工超支' },
      { projectId: projectsInDb[0]?.id || null, quotationId: null, type: 'overhead' as CostDimensionType, name: '制造费用', budgetAmount: 42000, actualAmount: 38000, varianceAmount: -4000, varianceRate: -0.0952, remark: '能耗控制良好' },
      { projectId: projectsInDb[0]?.id || null, quotationId: null, type: 'logistics' as CostDimensionType, name: '运输费', budgetAmount: 35000, actualAmount: 37000, varianceAmount: 2000, varianceRate: 0.0571, remark: '油价上涨导致运输费略增' },
      { projectId: projectsInDb[0]?.id || null, quotationId: null, type: 'outsourcing' as CostDimensionType, name: '外包费用', budgetAmount: 28000, actualAmount: 28000, varianceAmount: 0, varianceRate: 0, remark: '喷塑外包费用' },
      // 项目2 成本维度
      { projectId: projectsInDb[1]?.id || null, quotationId: null, type: 'material' as CostDimensionType, name: '原材料成本（预估）', budgetAmount: 580000, actualAmount: 0, varianceAmount: -580000, varianceRate: -1, remark: '项目尚未启动' },
      { projectId: projectsInDb[1]?.id || null, quotationId: null, type: 'labor' as CostDimensionType, name: '人工成本（预估）', budgetAmount: 180000, actualAmount: 0, varianceAmount: -180000, varianceRate: -1, remark: '项目尚未启动' },
      // 报价1 成本维度
      { projectId: null, quotationId: quotationsInDb[0]?.id || null, type: 'material' as CostDimensionType, name: '报价材料成本', budgetAmount: 595000, actualAmount: 595000, varianceAmount: 0, varianceRate: 0, remark: '报价成本核算' },
      { projectId: null, quotationId: quotationsInDb[0]?.id || null, type: 'labor' as CostDimensionType, name: '报价人工成本', budgetAmount: 85000, actualAmount: 85000, varianceAmount: 0, varianceRate: 0, remark: '报价成本核算' },
    ];

    const savedDims: CostDimension[] = [];
    for (const cd of costDimensions) {
      const entity = costDimensionRepo.create({ ...cd, createdBy: adminId, updatedBy: adminId });
      savedDims.push(await costDimensionRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedDims.length} 个成本维度`);

    // 成本预警
    const alerts = [
      { projectId: projectsInDb[0]?.id || null, costDimensionId: savedDims[1]?.id || null, level: 'warning' as CostAlertLevel, title: '人工成本超支预警', content: '项目PRJ-2026-001人工成本超出预算8.24%，建议关注加班管控', thresholdValue: 85000, actualValue: 92000, isRead: false, isResolved: false, triggeredAt: '2026-06-19T10:00:00', resolvedAt: null },
      { projectId: projectsInDb[0]?.id || null, costDimensionId: savedDims[3]?.id || null, level: 'info' as CostAlertLevel, title: '运输费轻微超支', content: '运输费超出预算5.71%，在可接受范围内', thresholdValue: 35000, actualValue: 37000, isRead: true, isResolved: false, triggeredAt: '2026-06-18T14:00:00', resolvedAt: null },
      { projectId: projectsInDb[1]?.id || null, costDimensionId: savedDims[5]?.id || null, level: 'critical' as CostAlertLevel, title: '项目成本预算待确认', content: '项目PRJ-2026-002尚未启动，预算金额58万元待审核确认', thresholdValue: 580000, actualValue: 0, isRead: false, isResolved: false, triggeredAt: '2026-06-20T09:00:00', resolvedAt: null },
    ];
    for (const a of alerts) {
      await costAlertRepo.save(costAlertRepo.create(a as any));
    }
    console.log(`  ✅ 创建 ${alerts.length} 个成本预警`);
  }

  // ===== M08 BOM 种子数据 =====
  {
    const bomRepo = dataSource.getRepository(BOM);
    const itemRepo = dataSource.getRepository(BomItem);
    const versionRepo = dataSource.getRepository(BomVersion);
    const altRepo = dataSource.getRepository(AlternativeMaterial);
    const adminId = SYSTEM_USER_ID;

    // 获取项目ID
    const projectRepo = dataSource.getRepository(Project);
    const projectsInDb = await projectRepo.find();
    const proj1Id = projectsInDb[0]?.id || null;
    const proj2Id = projectsInDb[1]?.id || null;

    const bomsData = [
      { projectId: proj1Id, shelfConfigId: null, version: 1, status: 'released' as const, totalWeight: 485.5, totalCost: 12800, createdBy: adminId, updatedBy: adminId },
      { projectId: proj1Id, shelfConfigId: null, version: 2, status: 'released' as const, totalWeight: 520.3, totalCost: 13500, createdBy: adminId, updatedBy: adminId },
      { projectId: proj2Id, shelfConfigId: null, version: 1, status: 'draft' as const, totalWeight: 310.2, totalCost: 8600, createdBy: adminId, updatedBy: adminId },
      { projectId: proj2Id, shelfConfigId: null, version: 1, status: 'archived' as const, totalWeight: 290.0, totalCost: 7800, createdBy: adminId, updatedBy: adminId },
    ];

    const savedBoms: BOM[] = [];
    for (const b of bomsData) {
      const entity = bomRepo.create(b);
      const saved = await bomRepo.save(entity) as unknown as BOM;
      savedBoms.push(saved);
    }
    console.log(`  ✅ 创建 ${savedBoms.length} 个BOM`);

    // BOM 明细
    const itemsData: Partial<BomItem>[] = [
      // BOM 1 - 轻型货架 (5项)
      { bomId: savedBoms[0].id, partCode: 'COL-H2000', partName: '立柱 H2000', material: 'Q235B', spec: '80×60×2.0', quantity: 8, unit: '根', length: 2000, weight: 7.6, unitCost: 45.6, totalCost: 364.8, wasteRate: 3, parentId: null, level: 0, sort: 0, alternativeIds: [], remark: '主立柱' },
      { bomId: savedBoms[0].id, partCode: 'BEAM-L1500', partName: '横梁 L1500', material: 'Q235B', spec: '100×50×1.5', quantity: 12, unit: '根', length: 1500, weight: 5.2, unitCost: 31.2, totalCost: 374.4, wasteRate: 2, parentId: null, level: 0, sort: 1, alternativeIds: [], remark: '层梁' },
      { bomId: savedBoms[0].id, partCode: 'PANEL-1500x500', partName: '层板 1500×500', material: 'Q235B', spec: '1.0mm', quantity: 4, unit: '块', length: 1500, weight: 5.9, unitCost: 35.4, totalCost: 141.6, wasteRate: 5, parentId: null, level: 0, sort: 2, alternativeIds: [], remark: '钢板层板' },
      { bomId: savedBoms[0].id, partCode: 'BRACE-D500', partName: '斜撑 D500', material: 'Q235B', spec: 'Φ25×1.5', quantity: 8, unit: '个', length: 500, weight: 1.4, unitCost: 8.4, totalCost: 67.2, wasteRate: 2, parentId: null, level: 0, sort: 3, alternativeIds: [], remark: '加强斜撑' },
      { bomId: savedBoms[0].id, partCode: 'BOLT-M8x30', partName: '螺栓 M8×30', material: '8.8级', spec: 'M8×30', quantity: 64, unit: '个', length: 30, weight: 0.03, unitCost: 0.5, totalCost: 32.0, wasteRate: 1, parentId: null, level: 0, sort: 4, alternativeIds: [], remark: '标准件' },
      // BOM 2 - 中型货架 (6项)
      { bomId: savedBoms[1].id, partCode: 'COL-H3000', partName: '立柱 H3000', material: 'Q235B', spec: '90×65×2.5', quantity: 8, unit: '根', length: 3000, weight: 14.2, unitCost: 85.2, totalCost: 681.6, wasteRate: 3, parentId: null, level: 0, sort: 0, alternativeIds: [], remark: '主立柱' },
      { bomId: savedBoms[1].id, partCode: 'BEAM-L2700', partName: '横梁 L2700', material: 'Q235B', spec: '120×60×2.0', quantity: 10, unit: '根', length: 2700, weight: 9.8, unitCost: 58.8, totalCost: 588.0, wasteRate: 2, parentId: null, level: 0, sort: 1, alternativeIds: [], remark: '层梁' },
      { bomId: savedBoms[1].id, partCode: 'PANEL-2700x1000', partName: '层板 2700×1000', material: 'Q235B', spec: '1.5mm', quantity: 5, unit: '块', length: 2700, weight: 21.2, unitCost: 127.2, totalCost: 636.0, wasteRate: 5, parentId: null, level: 0, sort: 2, alternativeIds: [], remark: '重型层板' },
      { bomId: savedBoms[1].id, partCode: 'BRACE-D1000', partName: '斜撑 D1000', material: 'Q235B', spec: 'Φ32×2.0', quantity: 8, unit: '个', length: 1000, weight: 3.1, unitCost: 18.6, totalCost: 148.8, wasteRate: 2, parentId: null, level: 0, sort: 3, alternativeIds: [], remark: '加强斜撑' },
      { bomId: savedBoms[1].id, partCode: 'BOLT-M10x35', partName: '螺栓 M10×35', material: '8.8级', spec: 'M10×35', quantity: 80, unit: '个', length: 35, weight: 0.05, unitCost: 0.8, totalCost: 64.0, wasteRate: 1, parentId: null, level: 0, sort: 4, alternativeIds: [], remark: '标准件' },
      { bomId: savedBoms[1].id, partCode: 'NUT-M10', partName: '螺母 M10', material: '8.8级', spec: 'M10', quantity: 80, unit: '个', length: 10, weight: 0.02, unitCost: 0.3, totalCost: 24.0, wasteRate: 1, parentId: null, level: 0, sort: 5, alternativeIds: [], remark: '标准件' },
      // BOM 3 - 草稿状态 (3项)
      { bomId: savedBoms[2].id, partCode: 'COL-H2500', partName: '立柱 H2500', material: 'Q235B', spec: '85×62×2.2', quantity: 6, unit: '根', length: 2500, weight: 10.5, unitCost: 63.0, totalCost: 378.0, wasteRate: 3, parentId: null, level: 0, sort: 0, alternativeIds: [], remark: '' },
      { bomId: savedBoms[2].id, partCode: 'BEAM-L1800', partName: '横梁 L1800', material: 'Q235B', spec: '110×55×1.8', quantity: 8, unit: '根', length: 1800, weight: 6.8, unitCost: 40.8, totalCost: 326.4, wasteRate: 2, parentId: null, level: 0, sort: 1, alternativeIds: [], remark: '' },
      { bomId: savedBoms[2].id, partCode: 'PANEL-1800x600', partName: '层板 1800×600', material: 'Q235B', spec: '1.2mm', quantity: 4, unit: '块', length: 1800, weight: 8.5, unitCost: 51.0, totalCost: 204.0, wasteRate: 5, parentId: null, level: 0, sort: 2, alternativeIds: [], remark: '' },
      // BOM 4 - 归档 (2项)
      { bomId: savedBoms[3].id, partCode: 'COL-H2000-OLD', partName: '立柱 H2000(旧版)', material: 'Q235B', spec: '75×55×1.8', quantity: 8, unit: '根', length: 2000, weight: 6.8, unitCost: 40.8, totalCost: 326.4, wasteRate: 3, parentId: null, level: 0, sort: 0, alternativeIds: [], remark: '已归档版本' },
      { bomId: savedBoms[3].id, partCode: 'BEAM-L1500-OLD', partName: '横梁 L1500(旧版)', material: 'Q235B', spec: '95×45×1.2', quantity: 12, unit: '根', length: 1500, weight: 4.2, unitCost: 25.2, totalCost: 302.4, wasteRate: 2, parentId: null, level: 0, sort: 1, alternativeIds: [], remark: '已归档版本' },
    ];

    const savedItems: BomItem[] = [];
    for (const item of itemsData) {
      const entity = itemRepo.create(item as any);
      const saved = await itemRepo.save(entity) as unknown as BomItem;
      savedItems.push(saved);
    }
    console.log(`  ✅ 创建 ${savedItems.length} 个BOM明细`);

    // BOM 版本
    const versionsData = [
      { bomId: savedBoms[0].id, version: 1, changeNote: '初始版本创建', changedItemIds: [], createdBy: adminId },
      { bomId: savedBoms[1].id, version: 1, changeNote: '初始版本创建', changedItemIds: [], createdBy: adminId },
      { bomId: savedBoms[1].id, version: 2, changeNote: '升级为中型货架，增加承重能力', changedItemIds: [savedItems[5]?.id, savedItems[6]?.id, savedItems[7]?.id].filter(Boolean), createdBy: adminId },
      { bomId: savedBoms[3].id, version: 1, changeNote: '旧版BOM，已被新版替代', changedItemIds: [], createdBy: adminId },
    ];
    for (const v of versionsData) {
      await versionRepo.save(versionRepo.create(v as any));
    }
    console.log(`  ✅ 创建 ${versionsData.length} 个BOM版本`);

    // 替代料
    const altsData = [
      { originalItemId: savedItems[0]?.id, partCode: 'COL-H2000-A1', partName: '立柱 H2000(替代)', material: 'Q345B', spec: '80×60×2.0', priority: 1, priceDiff: 5.2, available: true, remark: '高强钢替代，成本略增' },
      { originalItemId: savedItems[0]?.id, partCode: 'COL-H2000-A2', partName: '立柱 H2000(铝合金)', material: '6063-T5', spec: '80×60×2.5', priority: 2, priceDiff: 22.0, available: true, remark: '铝合金替代，轻量化但成本高' },
      { originalItemId: savedItems[2]?.id, partCode: 'PANEL-WOOD', partName: '木质层板 1500×500', material: '胶合板', spec: '18mm', priority: 1, priceDiff: -15.0, available: true, remark: '木质替代，成本更低但承重差' },
      { originalItemId: savedItems[6]?.id, partCode: 'BEAM-L2700-A1', partName: '横梁 L2700(加厚)', material: 'Q235B', spec: '130×65×2.5', priority: 1, priceDiff: 12.5, available: true, remark: '加厚型，承重提升20%' },
    ].filter(a => a.originalItemId);

    for (const a of altsData) {
      await altRepo.save(altRepo.create(a as any));
    }
    console.log(`  ✅ 创建 ${altsData.length} 个替代料`);
  }

  // ===== M10 设备管理 种子数据 =====
  {
    const eqRepo = dataSource.getRepository(Equipment);
    const adminId = SYSTEM_USER_ID;

    const equipmentData = [
      { name: '数控冲床 AMADA-253', code: 'EQ-CNC-001', type: 'cnc_punch', workshop: '钣金车间', status: 'running', capacity: 100, currentLoad: 75, nextMaintenance: '2026-07-15', createdBy: adminId, updatedBy: adminId },
      { name: '激光切割机 TRUMPF-3030', code: 'EQ-LASER-001', type: 'laser_cutting', workshop: '钣金车间', status: 'running', capacity: 80, currentLoad: 60, nextMaintenance: '2026-07-20', createdBy: adminId, updatedBy: adminId },
      { name: '折弯机 AMADA-5020', code: 'EQ-BEND-001', type: 'bending', workshop: '钣金车间', status: 'idle', capacity: 60, currentLoad: 0, nextMaintenance: '2026-08-01', createdBy: adminId, updatedBy: adminId },
      { name: '焊接机器人 KUKA-KR16', code: 'EQ-WELD-001', type: 'welding_robot', workshop: '焊接车间', status: 'running', capacity: 50, currentLoad: 40, nextMaintenance: '2026-07-10', createdBy: adminId, updatedBy: adminId },
      { name: '焊接工作站 manual-01', code: 'EQ-WELD-002', type: 'welding_manual', workshop: '焊接车间', status: 'idle', capacity: 30, currentLoad: 0, nextMaintenance: '2026-07-25', createdBy: adminId, updatedBy: adminId },
      { name: '喷塑流水线 GEMA-01', code: 'EQ-PAINT-001', type: 'powder_coating', workshop: '表面处理车间', status: 'running', capacity: 200, currentLoad: 120, nextMaintenance: '2026-06-28', createdBy: adminId, updatedBy: adminId },
      { name: '固化炉 OVEN-01', code: 'EQ-OVEN-001', type: 'curing_oven', workshop: '表面处理车间', status: 'running', capacity: 200, currentLoad: 120, nextMaintenance: '2026-08-10', createdBy: adminId, updatedBy: adminId },
      { name: '包装台 PACK-01', code: 'EQ-PACK-001', type: 'packaging', workshop: '包装车间', status: 'idle', capacity: 150, currentLoad: 0, nextMaintenance: '2026-09-01', createdBy: adminId, updatedBy: adminId },
    ];
    const savedEq: Equipment[] = [];
    for (const e of equipmentData) {
      const entity = eqRepo.create(e);
      const saved = await eqRepo.save(entity) as unknown as Equipment;
      savedEq.push(saved);
    }
    console.log(`  ✅ 创建 ${savedEq.length} 台设备`);
  }

  // ===== M10 排程 种子数据 =====
  {
    const schRepo = dataSource.getRepository(ScheduleItem);
    const eqRepo = dataSource.getRepository(Equipment);
    const woRepo = dataSource.getRepository(WorkOrder);
    const stepRepo = dataSource.getRepository(ProcessStep);

    const allEq = await eqRepo.find();
    const allWOs = await woRepo.find();
    const allSteps = await stepRepo.find();

    if (allWOs.length > 0 && allEq.length > 0 && allSteps.length > 0) {
      const scheduleData = [
        { workOrderId: allWOs[0].id, processStepId: allSteps[0]?.id || allSteps[0].id, equipmentId: allEq[0].id, equipmentName: allEq[0].name, startTime: '2026-06-21T08:00:00', endTime: '2026-06-21T12:00:00', status: 'completed' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[1]?.id || allSteps[1].id, equipmentId: allEq[1].id, equipmentName: allEq[1].name, startTime: '2026-06-21T13:00:00', endTime: '2026-06-21T17:00:00', status: 'in_progress' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[2]?.id || allSteps[2].id, equipmentId: allEq[3].id, equipmentName: allEq[3].name, startTime: '2026-06-22T08:00:00', endTime: '2026-06-22T16:00:00', status: 'planned' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[3]?.id || allSteps[3].id, equipmentId: allEq[5].id, equipmentName: allEq[5].name, startTime: '2026-06-23T08:00:00', endTime: '2026-06-23T12:00:00', status: 'planned' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[4]?.id || allSteps[4].id, equipmentId: allEq[6].id, equipmentName: allEq[6].name, startTime: '2026-06-23T13:00:00', endTime: '2026-06-23T18:00:00', status: 'planned' },
        { workOrderId: allWOs[1]?.id || allWOs[0].id, processStepId: allSteps[5]?.id || allSteps[0].id, equipmentId: allEq[0].id, equipmentName: allEq[0].name, startTime: '2026-06-22T08:00:00', endTime: '2026-06-22T12:00:00', status: 'planned' },
        { workOrderId: allWOs[1]?.id || allWOs[0].id, processStepId: allSteps[6]?.id || allSteps[1].id, equipmentId: allEq[1].id, equipmentName: allEq[1].name, startTime: '2026-06-22T13:00:00', endTime: '2026-06-22T17:00:00', status: 'planned' },
        { workOrderId: allWOs[2]?.id || allWOs[0].id, processStepId: allSteps[10]?.id || allSteps[0].id, equipmentId: allEq[2].id, equipmentName: allEq[2].name, startTime: '2026-06-24T08:00:00', endTime: '2026-06-24T12:00:00', status: 'planned' },
      ];
      for (const s of scheduleData) {
        await schRepo.save(schRepo.create(s as any));
      }
      console.log(`  ✅ 创建 ${scheduleData.length} 条排程记录`);
    }
  }

  // ===== M10 扫码记录 种子数据 =====
  {
    const srRepo = dataSource.getRepository(ScanRecord);
    const woRepo = dataSource.getRepository(WorkOrder);
    const stepRepo = dataSource.getRepository(ProcessStep);

    const allWOs = await woRepo.find();
    const allSteps = await stepRepo.find();
    if (allWOs.length > 0 && allSteps.length > 0) {
      const scanData = [
        { workOrderId: allWOs[0].id, processStepId: allSteps[0]?.id || allSteps[0].id, operatorId: SYSTEM_USER_ID, operatorName: '张师傅', type: 'start', quantity: 0, defectQty: 0, scannedAt: '2026-06-21T08:05:00', remark: '开工扫码' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[0]?.id || allSteps[0].id, operatorId: SYSTEM_USER_ID, operatorName: '张师傅', type: 'complete', quantity: 50, defectQty: 1, scannedAt: '2026-06-21T11:50:00', remark: '冲压完成，1件表面划伤' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[1]?.id || allSteps[1].id, operatorId: SYSTEM_USER_ID, operatorName: '李师傅', type: 'start', quantity: 0, defectQty: 0, scannedAt: '2026-06-21T13:05:00', remark: '激光切割开工' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[1]?.id || allSteps[1].id, operatorId: SYSTEM_USER_ID, operatorName: '李师傅', type: 'complete', quantity: 49, defectQty: 0, scannedAt: '2026-06-21T16:45:00', remark: '切割完成' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[2]?.id || allSteps[2].id, operatorId: SYSTEM_USER_ID, operatorName: '王师傅', type: 'material', quantity: 49, defectQty: 0, scannedAt: '2026-06-22T08:10:00', remark: '焊接物料到位' },
      ];
      for (const s of scanData) {
        await srRepo.save(srRepo.create(s as any));
      }
      console.log(`  ✅ 创建 ${scanData.length} 条扫码记录`);
    }
  }

  // ===== M10 质量检查 种子数据 =====
  {
    const qcRepo = dataSource.getRepository(QualityCheck);
    const defectRepo = dataSource.getRepository(Defect);
    const woRepo = dataSource.getRepository(WorkOrder);
    const stepRepo = dataSource.getRepository(ProcessStep);

    const allWOs = await woRepo.find();
    const allSteps = await stepRepo.find();
    if (allWOs.length > 0) {
      const qcData = [
        { workOrderId: allWOs[0].id, processStepId: allSteps[0]?.id || null, inspectorId: SYSTEM_USER_ID, inspectorName: '质检员-赵', type: 'first_article', result: 'pass', checkedAt: '2026-06-21T09:00:00', remark: '首件检验合格' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[1]?.id || null, inspectorId: SYSTEM_USER_ID, inspectorName: '质检员-赵', type: 'in_process', result: 'conditional', checkedAt: '2026-06-21T15:00:00', remark: '过程检验：1件划伤，可返修' },
        { workOrderId: allWOs[0].id, processStepId: allSteps[4]?.id || null, inspectorId: SYSTEM_USER_ID, inspectorName: '质检员-钱', type: 'final', result: 'pass', checkedAt: '2026-06-23T17:30:00', remark: '终检合格，可入库' },
        { workOrderId: allWOs[1]?.id || allWOs[0].id, processStepId: allSteps[5]?.id || null, inspectorId: SYSTEM_USER_ID, inspectorName: '质检员-赵', type: 'first_article', result: 'pass', checkedAt: '2026-06-22T09:30:00', remark: '首件合格' },
      ];
      const savedQCs: QualityCheck[] = [];
      for (const q of qcData) {
        const entity = qcRepo.create(q as any);
        const saved = await qcRepo.save(entity) as unknown as QualityCheck;
        savedQCs.push(saved);
      }
      console.log(`  ✅ 创建 ${savedQCs.length} 条质检记录`);

      // 缺陷记录
      const defectData = [
        { workOrderId: allWOs[0].id, processStepId: allSteps[0]?.id || null, qualityCheckId: savedQCs[1]?.id || null, type: 'surface', severity: 'minor', quantity: 1, description: '立柱表面划伤约5cm', reportedAt: '2026-06-21T15:05:00', reporterName: '质检员-赵', status: 'resolved', resolved: true, resolvedAt: '2026-06-21T16:00:00', resolvedBy: SYSTEM_USER_ID },
        { workOrderId: allWOs[0].id, processStepId: allSteps[2]?.id || null, qualityCheckId: null, type: 'welding', severity: 'major', quantity: 2, description: '焊缝气孔超标', reportedAt: '2026-06-22T10:00:00', reporterName: '王师傅', status: 'open', resolved: false, resolvedAt: null, resolvedBy: null as any },
        { workOrderId: allWOs[0].id, processStepId: allSteps[3]?.id || null, qualityCheckId: savedQCs[2]?.id || null, type: 'dimension', severity: 'minor', quantity: 1, description: '喷塑色差轻微偏差', reportedAt: '2026-06-23T14:00:00', reporterName: '质检员-钱', status: 'resolved', resolved: true, resolvedAt: '2026-06-23T15:30:00', resolvedBy: SYSTEM_USER_ID },
      ];
      for (const d of defectData) {
        await defectRepo.save(defectRepo.create(d as any));
      }
      console.log(`  ✅ 创建 ${defectData.length} 条缺陷记录`);
    }
  }

  // ===== M10 OEE 种子数据 =====
  {
    const oeeRepo = dataSource.getRepository(OeeData);
    const eqRepo = dataSource.getRepository(Equipment);
    const allEq = await eqRepo.find();
    if (allEq.length > 0) {
      const oeeData = [
        { equipmentId: allEq[0].id, equipmentName: allEq[0].name, date: '2026-06-20', availability: 87.5, performance: 92.3, quality: 98.0, oee: 79.1, plannedTime: 480, runTime: 420, idealCycle: 2, actualCycle: 2.2, totalOutput: 190, goodOutput: 186 },
        { equipmentId: allEq[0].id, equipmentName: allEq[0].name, date: '2026-06-21', availability: 91.7, performance: 88.5, quality: 97.9, oee: 79.3, plannedTime: 480, runTime: 440, idealCycle: 2, actualCycle: 2.3, totalOutput: 191, goodOutput: 187 },
        { equipmentId: allEq[1].id, equipmentName: allEq[1].name, date: '2026-06-20', availability: 95.0, performance: 85.0, quality: 100, oee: 80.8, plannedTime: 480, runTime: 456, idealCycle: 3, actualCycle: 3.5, totalOutput: 130, goodOutput: 130 },
        { equipmentId: allEq[1].id, equipmentName: allEq[1].name, date: '2026-06-21', availability: 83.3, performance: 90.0, quality: 98.5, oee: 73.9, plannedTime: 480, runTime: 400, idealCycle: 3, actualCycle: 3.3, totalOutput: 121, goodOutput: 119 },
        { equipmentId: allEq[3].id, equipmentName: allEq[3].name, date: '2026-06-21', availability: 75.0, performance: 82.0, quality: 95.0, oee: 58.4, plannedTime: 480, runTime: 360, idealCycle: 5, actualCycle: 6.1, totalOutput: 59, goodOutput: 56 },
        { equipmentId: allEq[5].id, equipmentName: allEq[5].name, date: '2026-06-21', availability: 96.0, performance: 75.0, quality: 99.0, oee: 71.3, plannedTime: 480, runTime: 461, idealCycle: 4, actualCycle: 5.3, totalOutput: 87, goodOutput: 86 },
      ];
      for (const o of oeeData) {
        await oeeRepo.save(oeeRepo.create(o as any));
      }
      console.log(`  ✅ 创建 ${oeeData.length} 条OEE数据`);
    }
  }

  // ===== M10 工艺路线 种子数据 =====
  {
    const routeRepo = dataSource.getRepository(ProcessRoute);
    const stepRepo = dataSource.getRepository(ProcessRouteStep);
    const shelfTypeRepo = dataSource.getRepository(ShelfType);
    const adminId = SYSTEM_USER_ID;

    const shelfTypes = await shelfTypeRepo.find();
    if (shelfTypes.length >= 2) {
      const routeData = [
        { name: '轻中型货架标准工艺路线', shelfTypeId: shelfTypes[0].id, createdBy: adminId, updatedBy: adminId },
        { name: '横梁式货架标准工艺路线', shelfTypeId: shelfTypes[1].id, createdBy: adminId, updatedBy: adminId },
      ];
      const savedRoutes: ProcessRoute[] = [];
      for (const r of routeData) {
        const entity = routeRepo.create(r as any);
        const saved = await routeRepo.save(entity) as unknown as ProcessRoute;
        savedRoutes.push(saved);
      }

      const routeStepsData: Partial<ProcessRouteStep>[] = [
        // 路线1: 轻中型货架
        { routeId: savedRoutes[0].id, stepCode: 'CUT-01', stepName: '板材下料', sequence: 1, equipmentType: 'laser_cutting', standardMinutes: 10, dependency: '' },
        { routeId: savedRoutes[0].id, stepCode: 'PUNCH-01', stepName: '冲孔', sequence: 2, equipmentType: 'cnc_punch', standardMinutes: 8, dependency: 'CUT-01' },
        { routeId: savedRoutes[0].id, stepCode: 'BEND-01', stepName: '折弯成型', sequence: 3, equipmentType: 'bending', standardMinutes: 12, dependency: 'PUNCH-01' },
        { routeId: savedRoutes[0].id, stepCode: 'WELD-01', stepName: '焊接组装', sequence: 4, equipmentType: 'welding_robot', standardMinutes: 20, dependency: 'BEND-01' },
        { routeId: savedRoutes[0].id, stepCode: 'PAINT-01', stepName: '表面喷塑', sequence: 5, equipmentType: 'powder_coating', standardMinutes: 15, dependency: 'WELD-01' },
        { routeId: savedRoutes[0].id, stepCode: 'OVEN-01', stepName: '固化烘烤', sequence: 6, equipmentType: 'curing_oven', standardMinutes: 25, dependency: 'PAINT-01' },
        { routeId: savedRoutes[0].id, stepCode: 'PACK-01', stepName: '包装入库', sequence: 7, equipmentType: 'packaging', standardMinutes: 10, dependency: 'OVEN-01' },
        // 路线2: 横梁式货架
        { routeId: savedRoutes[1].id, stepCode: 'CUT-02', stepName: '型材切割', sequence: 1, equipmentType: 'laser_cutting', standardMinutes: 8, dependency: '' },
        { routeId: savedRoutes[1].id, stepCode: 'WELD-02', stepName: '机器人焊接', sequence: 2, equipmentType: 'welding_robot', standardMinutes: 25, dependency: 'CUT-02' },
        { routeId: savedRoutes[1].id, stepCode: 'PAINT-02', stepName: '喷塑', sequence: 3, equipmentType: 'powder_coating', standardMinutes: 18, dependency: 'WELD-02' },
        { routeId: savedRoutes[1].id, stepCode: 'PACK-02', stepName: '包装', sequence: 4, equipmentType: 'packaging', standardMinutes: 8, dependency: 'PAINT-02' },
      ];
      for (const s of routeStepsData) {
        await stepRepo.save(stepRepo.create(s as any));
      }
      console.log(`  ✅ 创建 ${savedRoutes.length} 条工艺路线, ${routeStepsData.length} 个工艺步骤`);
    }
  }

  // ===== M10 物料需求 种子数据 =====
  {
    const mdRepo = dataSource.getRepository(MaterialDemand);
    const woRepo = dataSource.getRepository(WorkOrder);
    const allWOs = await woRepo.find();
    if (allWOs.length > 0) {
      const mdData = [
        { workOrderId: allWOs[0].id, bomItemId: null, material: 'Q235B钢板 2.0mm', spec: '1250×2500mm', requiredQty: 120, availableQty: 6500, shortageQty: 0, unit: 'kg', plannedDate: '2026-06-21', status: 'satisfied' },
        { workOrderId: allWOs[0].id, bomItemId: null, material: 'Q235B钢板 1.5mm', spec: '1250×2500mm', requiredQty: 80, availableQty: 4200, shortageQty: 0, unit: 'kg', plannedDate: '2026-06-21', status: 'satisfied' },
        { workOrderId: allWOs[0].id, bomItemId: null, material: '内六角螺栓 M8×30', spec: 'M8×30 8.8级', requiredQty: 512, availableQty: 35000, shortageQty: 0, unit: '个', plannedDate: '2026-06-22', status: 'satisfied' },
        { workOrderId: allWOs[0].id, bomItemId: null, material: '拉伸缠绕膜', spec: '500mm×0.05mm', requiredQty: 10, availableQty: 180, shortageQty: 0, unit: '卷', plannedDate: '2026-06-23', status: 'satisfied' },
        { workOrderId: allWOs[1]?.id || allWOs[0].id, bomItemId: null, material: 'Q235B钢板 2.5mm', spec: '1500×3000mm', requiredQty: 200, availableQty: 0, shortageQty: 200, unit: 'kg', plannedDate: '2026-06-22', status: 'short' },
        { workOrderId: allWOs[1]?.id || allWOs[0].id, bomItemId: null, material: 'Q235B方管 60×40×2.0', spec: '6000mm', requiredQty: 60, availableQty: 160, shortageQty: 0, unit: '根', plannedDate: '2026-06-22', status: 'satisfied' },
      ];
      for (const m of mdData) {
        await mdRepo.save(mdRepo.create(m as any));
      }
      console.log(`  ✅ 创建 ${mdData.length} 条物料需求`);
    }
  }

  // ===== M09 采购管理+SRM 种子数据 =====
  // ─── 供应商管理 ───
  const supplierRepo = dataSource.getRepository(Supplier);

  if (await supplierRepo.count() === 0) {
    const suppliers = [
      {
        code: 'SUP-001',
        name: '上海宝钢钢材贸易有限公司',
        taxId: '91310000MA1FL8XX2X',
        supplyCategories: '钢材,型材',
        contactName: '陈经理',
        contactPhone: '13800001111',
        contactEmail: 'chen@baosteel.com',
        bankAccount: '6222021234567890123',
        bankName: '中国工商银行上海分行',
        rating: 'A' as SupplierRating,
        status: 'active' as SupplierStatus,
        address: '上海市浦东新区世纪大道100号',
        remark: '主要供应商，产品质量稳定',
      },
      {
        code: 'SUP-002',
        name: '苏州标准件制造厂',
        taxId: '91320500MA1XX3YY5Y',
        supplyCategories: '标准件,紧固件',
        contactName: '周厂长',
        contactPhone: '13900002222',
        contactEmail: 'zhou@szbzj.com',
        bankAccount: '6222022345678901234',
        bankName: '中国建设银行苏州分行',
        rating: 'B' as SupplierRating,
        status: 'active' as SupplierStatus,
        address: '江苏省苏州市工业园区星湖街328号',
        remark: '螺栓、螺母等标准件供应商',
      },
      {
        code: 'SUP-003',
        name: '杭州表面处理科技有限公司',
        taxId: '91330100MA2XX5ZZ8Z',
        supplyCategories: '表面处理,喷塑加工',
        contactName: '吴总',
        contactPhone: '13700003333',
        contactEmail: 'wu@hzbmcl.com',
        bankAccount: '6222023456789012345',
        bankName: '中国农业银行杭州分行',
        rating: 'C' as SupplierRating,
        status: 'active' as SupplierStatus,
        address: '浙江省杭州市余杭区闲林工业区8号',
        remark: '表面处理外包供应商',
      },
    ];

    const savedSuppliers: Supplier[] = [];
    for (const s of suppliers) {
      const entity = supplierRepo.create({ ...s, createdBy: adminId, updatedBy: adminId });
      savedSuppliers.push(await supplierRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedSuppliers.length} 个供应商`);
  }

  // ─── 采购申请 ───
  const requisitionRepo = dataSource.getRepository(PurchaseRequisition);
  const purchaseOrderRepoForPR = dataSource.getRepository(PurchaseOrder);

  if (await requisitionRepo.count() === 0) {
    const suppliersInDb = await supplierRepo.find();
    const purchaseOrdersInDb = await purchaseOrderRepoForPR.find();

    const requisitions = [
      {
        code: 'PRQ202506001',
        projectId: null,
        materialCode: 'RAW-Q235B-COIL',
        materialName: 'Q235B热轧钢板',
        spec: '3.0×1500×6000mm',
        quantity: 5000,
        unit: 'kg',
        demandDate: '2026-07-10',
        suggestedSupplierId: suppliersInDb[0]?.id || null,
        urgency: 'normal' as RequisitionUrgency,
        status: 'approved' as RequisitionStatus,
        approvedBy: adminId,
        approvedAt: new Date('2026-06-20'),
        remark: '生产用钢材采购申请',
      },
      {
        code: 'PRQ202506002',
        projectId: null,
        materialCode: 'STD-BOLT-M12',
        materialName: '内六角螺栓',
        spec: 'M12×40 10.9级',
        quantity: 10000,
        unit: '个',
        demandDate: '2026-07-05',
        suggestedSupplierId: suppliersInDb[1]?.id || null,
        urgency: 'urgent' as RequisitionUrgency,
        status: 'submitted' as RequisitionStatus,
        approvedBy: null,
        approvedAt: null,
        remark: '紧急采购，生产急需',
      },
    ];

    const savedRequisitions: PurchaseRequisition[] = [];
    for (const r of requisitions) {
      const entity = requisitionRepo.create({ ...r, createdBy: adminId, updatedBy: adminId });
      savedRequisitions.push(await requisitionRepo.save(entity));
    }
    console.log(`  ✅ 创建 ${savedRequisitions.length} 个采购申请`);
  }

  // ─── 来料检验 ───
  const inspectionRepo = dataSource.getRepository(ReceivingInspection);

  if (await inspectionRepo.count() === 0) {
    const purchaseOrdersInDb = await purchaseOrderRepoForPR.find();

    const inspections = [
      {
        purchaseOrderId: purchaseOrdersInDb[0]?.id || null,
        purchaseOrderCode: purchaseOrdersInDb[0]?.code || 'PO-2026-001',
        inspectionNo: 'INS202506001',
        inspector: '检验员-张',
        inspectionDate: new Date('2026-06-25'),
        appearance: 'pass' as InspectionResult,
        dimension: 'pass' as InspectionResult,
        materialQuality: 'pass' as InspectionResult,
        coating: 'pass' as InspectionResult,
        quantityCheck: 'pass' as InspectionResult,
        result: 'accepted' as InspectionOverallResult,
        defectDesc: null,
        remark: '钢材到货检验合格',
        createdBy: adminId,
        updatedBy: adminId,
      },
      {
        purchaseOrderId: purchaseOrdersInDb[1]?.id || null,
        purchaseOrderCode: purchaseOrdersInDb[1]?.code || 'PO-2026-002',
        inspectionNo: 'INS202506002',
        inspector: '检验员-李',
        inspectionDate: new Date('2026-06-26'),
        appearance: 'pass' as InspectionResult,
        dimension: 'fail' as InspectionResult,
        materialQuality: 'pass' as InspectionResult,
        coating: 'pass' as InspectionResult,
        quantityCheck: 'pass' as InspectionResult,
        result: 'concession' as InspectionOverallResult,
        defectDesc: '部分螺栓长度偏差+1mm，在允许范围内',
        remark: '尺寸略有偏差，让步接收',
        createdBy: adminId,
        updatedBy: adminId,
      },
    ];

    for (const i of inspections) {
      const inspection = inspectionRepo.create({
        ...i,
        defectDesc: i.defectDesc || undefined,
      });
      await inspectionRepo.save(inspection);
    }
    console.log(`  ✅ 创建 ${inspections.length} 条来料检验记录`);
  }

  // ===== M03 方案设计+图文档 种子数据 =====
  {
    const schemeRepo = dataSource.getRepository(Scheme);
    const versionRepo = dataSource.getRepository(SchemeVersion);
    const drawingRepo = dataSource.getRepository(Drawing);

    if (await schemeRepo.count() === 0) {
      const customers = await dataSource.getRepository(Customer).find();
      const projects = await dataSource.getRepository(Project).find();
      const inquiries = await dataSource.getRepository(Inquiry).find();
      const adminUser = await userRepo.findOne({ where: { username: 'admin' } });
      const adminId = adminUser?.id || SYSTEM_USER_ID;

      const schemes = [
        {
          code: 'FA202606001',
          name: '华东物流横梁式货架方案',
          inquiryId: inquiries[0]?.id || null,
          projectId: projects[0]?.id || null,
          customerId: customers[0]?.id || null,
          rackType: '横梁式货架',
          description: '5层横梁式货架，高度6m，长度2.7m，深度1m，承重500kg/层',
          currentVersion: 'V1.0',
          status: 'approved' as SchemeStatus,
          createdBy: adminId,
          updatedBy: adminId,
        },
        {
          code: 'FA202606002',
          name: '苏州恒达贯通式货架方案',
          inquiryId: inquiries[1]?.id || null,
          projectId: projects[1]?.id || null,
          customerId: customers[2]?.id || null,
          rackType: '贯通式货架',
          description: '贯通式货架，高度10m，深度1.2m，承重1000kg/层',
          currentVersion: 'V1.1',
          status: 'submitted' as SchemeStatus,
          createdBy: adminId,
          updatedBy: adminId,
        },
      ];

      const savedSchemes: Scheme[] = [];
      for (const s of schemes) {
        const entity = schemeRepo.create(s);
        savedSchemes.push(await schemeRepo.save(entity));
      }
      console.log(`  ✅ 创建 ${savedSchemes.length} 个方案`);

      // 方案版本
      const versions = [
        { schemeId: savedSchemes[0].id, versionNo: 'V1.0', changeSummary: '初始方案版本', attachments: '', status: 'approved', approvedBy: adminId, approvedAt: new Date('2026-06-15'), createdBy: adminId },
        { schemeId: savedSchemes[1].id, versionNo: 'V1.0', changeSummary: '初始方案版本', attachments: '', status: 'approved', approvedBy: adminId, approvedAt: new Date('2026-06-16'), createdBy: adminId },
        { schemeId: savedSchemes[1].id, versionNo: 'V1.1', changeSummary: '增加通道宽度，优化存取效率', attachments: '[{"name":"布局图V1.1.pdf","url":"/uploads/drawings/layout-v1.1.pdf"}]', status: 'draft', approvedBy: null, approvedAt: null, createdBy: adminId },
      ];
      for (const v of versions) {
        await versionRepo.save(versionRepo.create(v));
      }
      console.log(`  ✅ 创建 ${versions.length} 个方案版本`);

      // 图纸
      const drawings = [
        { code: 'DWG-PRJ001-ASSEMBLY-001', name: '华东物流项目总装图', projectId: projects[0]?.id || null, schemeId: savedSchemes[0].id, category: 'assembly' as DrawingCategory, fileUrl: '/uploads/drawings/PRJ001-assembly.dwg', fileSize: 2048000, fileType: 'DWG', status: 'published' as DrawingStatus, version: 'V1.0', uploadedBy: adminId, uploadedAt: new Date('2026-06-14'), remark: '总装图已发布', createdBy: adminId, updatedBy: adminId },
        { code: 'DWG-PRJ001-COMPONENT-001', name: '横梁零件图', projectId: projects[0]?.id || null, schemeId: savedSchemes[0].id, category: 'component' as DrawingCategory, fileUrl: '/uploads/drawings/PRJ001-beam.dwg', fileSize: 1024000, fileType: 'DWG', status: 'reviewing' as DrawingStatus, version: 'V1.0', uploadedBy: adminId, uploadedAt: new Date('2026-06-15'), remark: '待审核', createdBy: adminId, updatedBy: adminId },
        { code: 'DWG-PRJ002-FOUNDATION-001', name: '苏州恒达项目基础图', projectId: projects[1]?.id || null, schemeId: savedSchemes[1].id, category: 'foundation' as DrawingCategory, fileUrl: '/uploads/drawings/PRJ002-foundation.pdf', fileSize: 512000, fileType: 'PDF', status: 'designing' as DrawingStatus, version: 'V1.0', uploadedBy: adminId, uploadedAt: new Date('2026-06-18'), remark: '基础图设计中', createdBy: adminId, updatedBy: adminId },
      ];
      for (const d of drawings) {
        await drawingRepo.save(drawingRepo.create(d));
      }
      console.log(`  ✅ 创建 ${drawings.length} 个图纸`);
    }
  }

  // ─── M15 安装管理 ───
  const planRepo = dataSource.getRepository(InstallPlan);
  const teamRepo = dataSource.getRepository(InstallTeam);
  const reportRepo = dataSource.getRepository(InstallReport);
  const costRepo = dataSource.getRepository(InstallCost);
  const issueRepo = dataSource.getRepository(InstallIssue);
  const acceptanceRepo = dataSource.getRepository(InstallAcceptance);

  if (await planRepo.count() === 0) {
    const projectsInDb = await dataSource.getRepository(Project).find();
    const contractsInDb = await dataSource.getRepository(Contract).find();

    const plans = [
      {
        code: 'IN202605001', projectId: projectsInDb[0]?.id || null, contractId: contractsInDb[0]?.id || null,
        siteAddress: '深圳市南山区前海路168号物流园区A栋', startDate: new Date('2026-06-20'),
        endDate: new Date('2026-07-15'), safetyBriefing: '1. 所有安装人员必须佩戴安全帽和高空作业安全带\n2. 货架组装时禁止交叉作业\n3. 电动工具使用前检查绝缘性能\n4. 每日完工后清理现场',
        status: 'in_progress' as const, createdBy: adminId, updatedBy: adminId,
      },
      {
        code: 'IN202606001', projectId: projectsInDb[1]?.id || null, contractId: contractsInDb[1]?.id || null,
        siteAddress: '上海市浦东新区华东路200号物流中心B区', startDate: new Date('2026-07-05'),
        endDate: new Date('2026-09-15'), safetyBriefing: '1. 横梁式货架立柱安装需2人配合作业\n2. 仓储区域限速5km/h\n3. 雷雨天气停止户外作业',
        status: 'draft' as const, createdBy: adminId, updatedBy: adminId,
      },
    ];
    const savedPlans: InstallPlan[] = [];
    for (const p of plans) {
      savedPlans.push(await planRepo.save(planRepo.create(p)));
    }
    console.log(`  ✅ 创建 ${savedPlans.length} 个安装计划`);

    // 安装人员
    const teams = [
      { planId: savedPlans[0].id, workerName: '张建国', workerRole: '队长' as const, certStatus: 'valid' as const, insuranceStatus: 'active' as const, createdBy: adminId },
      { planId: savedPlans[0].id, workerName: '李强', workerRole: '安装工' as const, certStatus: 'valid' as const, insuranceStatus: 'active' as const, createdBy: adminId },
      { planId: savedPlans[0].id, workerName: '王明', workerRole: '助手' as const, certStatus: 'expired' as const, insuranceStatus: 'active' as const, createdBy: adminId },
    ];
    for (const t of teams) {
      await teamRepo.save(teamRepo.create(t));
    }
    console.log(`  ✅ 创建 ${teams.length} 个安装人员`);

    // 报工记录
    const reports = [
      { planId: savedPlans[0].id, workerName: '张建国', workDate: new Date('2026-06-21'), startTime: '08:00', endTime: '17:30', overtimeHours: 1.5, workContent: '立柱定位放线、底脚锚固', completionPercent: 15, createdBy: adminId },
      { planId: savedPlans[0].id, workerName: '李强', workDate: new Date('2026-06-21'), startTime: '08:00', endTime: '17:00', overtimeHours: 0, workContent: '横梁安装、层板铺设', completionPercent: 20, createdBy: adminId },
    ];
    for (const r of reports) {
      await reportRepo.save(reportRepo.create(r));
    }
    console.log(`  ✅ 创建 ${reports.length} 条报工记录`);

    // 成本记录
    const costs = [
      { planId: savedPlans[0].id, laborFee: 15000, travelFee: 2000, accommodationFee: 3000, toolCost: 800, materialCost: 5000, totalCost: 25800, createdBy: adminId, updatedBy: adminId },
    ];
    for (const c of costs) {
      await costRepo.save(costRepo.create(c));
    }
    console.log(`  ✅ 创建 ${costs.length} 条成本记录`);

    // 现场问题
    const issues = [
      { planId: savedPlans[0].id, issueType: '缺件' as const, severity: 'high' as const, description: '横梁连接件缺50套，现场无法继续横梁安装', photoUrls: ['/uploads/issues/missing-connectors-1.jpg'], status: 'open' as const, resolvedAt: null, solution: null, createdBy: adminId },
      { planId: savedPlans[0].id, issueType: '客户追加需求' as const, severity: 'medium' as const, description: '客户要求A区增加5组货架，需重新评估设计方案', photoUrls: [], status: 'in_progress' as const, resolvedAt: null, solution: '已提交设计变更申请', createdBy: adminId },
    ];
    for (const i of issues) {
      await issueRepo.save(issueRepo.create(i));
    }
    console.log(`  ✅ 创建 ${issues.length} 条现场问题`);

    // 验收记录
    const acceptances = [
      { planId: savedPlans[0].id, contractId: contractsInDb[0]?.id || null, acceptDate: null, customerSign: null, result: 'with_issues' as const, issueDesc: '现场存在缺件问题，待补发后二次验收', warrantyStartDate: null, warrantyEndDate: null, createdBy: adminId },
    ];
    for (const a of acceptances) {
      await acceptanceRepo.save(acceptanceRepo.create(a));
    }
    console.log(`  ✅ 创建 ${acceptances.length} 条验收记录`);
  }

  // ─── M13 财务总账 ───
  await runM13AccountSeed(dataSource, adminId);

  // ─── M13 银行账户 ───
  const bankAccountRepo = dataSource.getRepository(BankAccount);
  const bankTransactionRepo = dataSource.getRepository(BankTransaction);

  if (await bankAccountRepo.count() === 0) {
    const bankAccounts = [
      { name: '基本户-工商银行', accountNo: '1202020609200012345', bankName: '中国工商银行南京分行', branchName: '江宁支行', currency: 'CNY', balance: 850000, accountType: 'bank' as const, remark: '公司基本户，日常收付款', createdBy: adminId, updatedBy: adminId },
      { name: '一般户-建设银行', accountNo: '32001598600056001234', bankName: '中国建设银行南京分行', branchName: '鼓楼支行', currency: 'CNY', balance: 320000, accountType: 'bank' as const, remark: '一般户，贷款及专项支出', createdBy: adminId, updatedBy: adminId },
      { name: '现金账户', accountNo: 'CASH-001', bankName: '内部', branchName: null, currency: 'CNY', balance: 50000, accountType: 'cash' as const, remark: '日常零星开支备用金', createdBy: adminId, updatedBy: adminId },
    ];
    const savedBankAccounts: BankAccount[] = [];
    for (const ba of bankAccounts) {
      savedBankAccounts.push(await bankAccountRepo.save(bankAccountRepo.create(ba)));
    }
    console.log(`  ✅ 创建 ${savedBankAccounts.length} 个银行账户`);

    // ─── M13 银行流水 ───
    const bankTransactions = [
      // 工行基本户流水
      { bankAccountId: savedBankAccounts[0].id, transactionDate: '2026-06-01', description: '前海供应链合同预付款30%', direction: 'in' as const, amount: 126000, balanceAfter: 976000, referenceNo: 'CON-2026-001-PRE', remark: '深圳前海30%预付', createdBy: adminId },
      { bankAccountId: savedBankAccounts[0].id, transactionDate: '2026-06-05', description: '付宝钢钢材款（部分）', direction: 'out' as const, amount: 280000, balanceAfter: 696000, referenceNo: 'PO-2026-001-PAY1', remark: '横梁式项目钢材采购首付', createdBy: adminId },
      { bankAccountId: savedBankAccounts[0].id, transactionDate: '2026-06-10', description: '付苏州标准件采购款', direction: 'out' as const, amount: 35000, balanceAfter: 661000, referenceNo: 'PO-2026-002-PAY1', remark: '标准件采购全额支付', createdBy: adminId },
      { bankAccountId: savedBankAccounts[0].id, transactionDate: '2026-06-15', description: '华东物流合同定金', direction: 'in' as const, amount: 180000, balanceAfter: 841000, referenceNo: 'CON-2026-002-DEPOSIT', remark: '华东物流意向定金', createdBy: adminId },
      { bankAccountId: savedBankAccounts[0].id, transactionDate: '2026-06-18', description: '付员工工资', direction: 'out' as const, amount: 156000, balanceAfter: 685000, referenceNo: 'SAL-2026-06', remark: '6月份员工工资发放', createdBy: adminId },
      // 建行一般户流水
      { bankAccountId: savedBankAccounts[1].id, transactionDate: '2026-06-03', description: '付杭州表面处理加工费', direction: 'out' as const, amount: 28000, balanceAfter: 292000, referenceNo: 'PO-2026-003-PAY1', remark: '喷塑外包费用', createdBy: adminId },
      { bankAccountId: savedBankAccounts[1].id, transactionDate: '2026-06-08', description: '贷款到期还款', direction: 'out' as const, amount: 100000, balanceAfter: 192000, referenceNo: 'LOAN-REP-2026-06', remark: '短期贷款季度还款', createdBy: adminId },
    ];
    for (const bt of bankTransactions) {
      await bankTransactionRepo.save(bankTransactionRepo.create(bt));
    }
    console.log(`  ✅ 创建 ${bankTransactions.length} 条银行流水`);
  }

  // ─── M13 应收账款 ───
  const receivableRepo = dataSource.getRepository(AccountsReceivable);
  const receiptRepo = dataSource.getRepository(Receipt);

  if (await receivableRepo.count() === 0) {
    const customersInDb = await customerRepo.find();
    const contractsInDb = await contractRepo.find();

    const receivables = [
      { receivableNo: 'AR-2026-001', customerId: customersInDb[3]?.id, customerName: '深圳前海供应链有限公司', contractId: contractsInDb[0]?.id, contractNo: 'CON-2026-001', amount: 420000, settledAmount: 126000, dueDate: '2026-07-15', status: 'partial' as const, remark: '轻中型货架合同，30%已收', createdBy: adminId, updatedBy: adminId },
      { receivableNo: 'AR-2026-002', customerId: customersInDb[0]?.id, customerName: '华东物流集团', contractId: contractsInDb[1]?.id, contractNo: 'CON-2026-002', amount: 1200000, settledAmount: 180000, dueDate: '2026-09-30', status: 'partial' as const, remark: '横梁式货架意向合同，仅收定金', createdBy: adminId, updatedBy: adminId },
      { receivableNo: 'AR-2026-003', customerId: customersInDb[1]?.id, customerName: '南京仓储设备有限公司', contractId: undefined, contractNo: undefined, amount: 85000, settledAmount: 0, dueDate: '2026-08-01', status: 'pending' as const, remark: '零散配件销售应收', createdBy: adminId, updatedBy: adminId },
      { receivableNo: 'AR-2026-004', customerId: customersInDb[5]?.id, customerName: '北京京东供应链基地', contractId: undefined, contractNo: undefined, amount: 425000, settledAmount: 0, dueDate: '2026-10-31', status: 'pending' as const, remark: '立体库方案报价转应收待签合同', createdBy: adminId, updatedBy: adminId },
    ];
    const savedReceivables: AccountsReceivable[] = [];
    for (const ar of receivables) {
      savedReceivables.push(await receivableRepo.save(receivableRepo.create(ar)));
    }
    console.log(`  ✅ 创建 ${savedReceivables.length} 条应收账款`);

    // ─── 收款记录 ───
    const receipts = [
      { receivableId: savedReceivables[0].id, receiptNo: 'RC-2026-001', receiptDate: '2026-06-01', amount: 126000, status: 'confirmed' as const, remark: '前海供应链30%预付款', createdBy: adminId },
      { receivableId: savedReceivables[1].id, receiptNo: 'RC-2026-002', receiptDate: '2026-06-15', amount: 180000, status: 'confirmed' as const, remark: '华东物流定金', createdBy: adminId },
    ];
    for (const rc of receipts) {
      await receiptRepo.save(receiptRepo.create(rc));
    }
    console.log(`  ✅ 创建 ${receipts.length} 条收款记录`);
  }

  // ─── M13 应付账款 ───
  const payableRepo = dataSource.getRepository(AccountsPayable);
  const paymentRepo = dataSource.getRepository(Payment);
  const paymentRequestRepo = dataSource.getRepository(PaymentRequest);

  if (await payableRepo.count() === 0) {
    const suppliersInDb = await supplierRepo.find();

    const payables = [
      { payableNo: 'AP-2026-001', supplierId: suppliersInDb[0]?.id, supplierName: '上海宝钢钢材贸易有限公司', purchaseOrderNo: 'PO-2026-001', amount: 380000, settledAmount: 280000, dueDate: '2026-07-28', status: 'partial' as const, remark: '横梁式钢材采购，已付首期', createdBy: adminId, updatedBy: adminId },
      { payableNo: 'AP-2026-002', supplierId: suppliersInDb[1]?.id, supplierName: '苏州标准件制造厂', purchaseOrderNo: 'PO-2026-002', amount: 45000, settledAmount: 35000, dueDate: '2026-07-15', status: 'partial' as const, remark: '标准件采购，部分已付', createdBy: adminId, updatedBy: adminId },
      { payableNo: 'AP-2026-003', supplierId: suppliersInDb[2]?.id, supplierName: '杭州表面处理科技有限公司', purchaseOrderNo: 'PO-2026-003', amount: 28000, settledAmount: 28000, dueDate: '2026-07-20', status: 'settled' as const, remark: '喷塑外包已全额支付', createdBy: adminId, updatedBy: adminId },
      { payableNo: 'AP-2026-004', supplierId: undefined, supplierName: '常州物流包装材料厂', purchaseOrderNo: 'PO-2026-004', amount: 12000, settledAmount: 0, dueDate: '2026-08-05', status: 'pending' as const, remark: '包装材料待付', createdBy: adminId, updatedBy: adminId },
    ];
    const savedPayables: AccountsPayable[] = [];
    for (const ap of payables) {
      savedPayables.push(await payableRepo.save(payableRepo.create(ap)));
    }
    console.log(`  ✅ 创建 ${savedPayables.length} 条应付账款`);

    // ─── 付款记录 ───
    const bankAccountsInDb = await bankAccountRepo.find();

    const payments = [
      { payableId: savedPayables[0].id, paymentNo: 'PAY-2026-001', paymentDate: '2026-06-05', bankAccountId: bankAccountsInDb[0]?.id, amount: 280000, status: 'confirmed' as const, remark: '宝钢钢材首期付款', createdBy: adminId },
      { payableId: savedPayables[1].id, paymentNo: 'PAY-2026-002', paymentDate: '2026-06-10', bankAccountId: bankAccountsInDb[0]?.id, amount: 35000, status: 'confirmed' as const, remark: '标准件采购全额付款', createdBy: adminId },
      { payableId: savedPayables[2].id, paymentNo: 'PAY-2026-003', paymentDate: '2026-06-03', bankAccountId: bankAccountsInDb[1]?.id, amount: 28000, status: 'confirmed' as const, remark: '喷塑加工费用', createdBy: adminId },
    ];
    for (const pm of payments) {
      await paymentRepo.save(paymentRepo.create(pm));
    }
    console.log(`  ✅ 创建 ${payments.length} 条付款记录`);

    // ─── 付款申请 ───
    const paymentRequests = [
      { payableId: savedPayables[0].id, requestNo: 'PR-2026-001', bankAccountId: bankAccountsInDb[0]?.id, amount: 100000, requestDate: '2026-06-25', status: 'approved' as const, approvedBy: adminId, approvedAt: '2026-06-26', remark: '宝钢钢材尾款申请', createdBy: adminId, updatedBy: adminId },
      { payableId: savedPayables[3].id, requestNo: 'PR-2026-002', bankAccountId: bankAccountsInDb[0]?.id, amount: 12000, requestDate: '2026-06-28', status: 'submitted' as const, approvedBy: undefined, approvedAt: undefined, remark: '包装材料付款申请', createdBy: adminId, updatedBy: adminId },
    ];
    for (const pr of paymentRequests) {
      await paymentRequestRepo.save(paymentRequestRepo.create(pr));
    }
    console.log(`  ✅ 创建 ${paymentRequests.length} 条付款申请`);
  }

  // ─── M13 凭证 ───
  const voucherRepo = dataSource.getRepository(Voucher);
  const voucherEntryRepo = dataSource.getRepository(VoucherEntry);

  if (await voucherRepo.count() === 0) {
    const accountsInDb = await dataSource.getRepository(Account).find();

    // 查找关键科目的ID
    const findAccount = (code: string) => accountsInDb.find(a => a.code === code)?.id || null;

    const vouchers = [
      { voucherNo: 'V-2026-06-001', voucherDate: '2026-06-01', attachmentCount: 2, totalDebit: 126000, totalCredit: 126000, status: 'posted' as const, postedBy: adminId, postedAt: '2026-06-02', remark: '前海供应链预付款收款', createdBy: adminId, updatedBy: adminId },
      { voucherNo: 'V-2026-06-002', voucherDate: '2026-06-05', attachmentCount: 3, totalDebit: 280000, totalCredit: 280000, status: 'posted' as const, postedBy: adminId, postedAt: '2026-06-06', remark: '宝钢钢材采购付款', createdBy: adminId, updatedBy: adminId },
      { voucherNo: 'V-2026-06-003', voucherDate: '2026-06-10', attachmentCount: 1, totalDebit: 35000, totalCredit: 35000, status: 'posted' as const, postedBy: adminId, postedAt: '2026-06-11', remark: '苏州标准件采购付款', createdBy: adminId, updatedBy: adminId },
      { voucherNo: 'V-2026-06-004', voucherDate: '2026-06-15', attachmentCount: 1, totalDebit: 180000, totalCredit: 180000, status: 'posted' as const, postedBy: adminId, postedAt: '2026-06-16', remark: '华东物流定金收款', createdBy: adminId, updatedBy: adminId },
      { voucherNo: 'V-2026-06-005', voucherDate: '2026-06-18', attachmentCount: 4, totalDebit: 156000, totalCredit: 156000, status: 'submitted' as const, postedBy: undefined, postedAt: undefined, remark: '6月份工资发放', createdBy: adminId, updatedBy: adminId },
      { voucherNo: 'V-2026-06-006', voucherDate: '2026-06-20', attachmentCount: 0, totalDebit: 85000, totalCredit: 85000, status: 'draft' as const, postedBy: undefined, postedAt: undefined, remark: '南京仓储配件销售记账（草稿）', createdBy: adminId, updatedBy: adminId },
    ];
    const savedVouchers: Voucher[] = [];
    for (const v of vouchers) {
      savedVouchers.push(await voucherRepo.save(voucherRepo.create(v)));
    }
    console.log(`  ✅ 创建 ${savedVouchers.length} 张凭证`);

    // ─── 凭证分录 ───
    const voucherEntries = [
      // V-001：前海预付款收款 → 借：银行存款 126000，贷：应收账款 126000
      { voucherId: savedVouchers[0].id, accountId: findAccount('1002')!, summary: '收前海供应链预付款', debitAmount: 126000, creditAmount: 0, auxData: '{"customer":"深圳前海供应链有限公司"}', sortOrder: 1 },
      { voucherId: savedVouchers[0].id, accountId: findAccount('1122')!, summary: '收前海供应链预付款', debitAmount: 0, creditAmount: 126000, auxData: '{"customer":"深圳前海供应链有限公司","contract":"CON-2026-001"}', sortOrder: 2 },

      // V-002：宝钢钢材付款 → 借：原材料 280000，贷：银行存款 280000
      { voucherId: savedVouchers[1].id, accountId: findAccount('1403')!, summary: '购入Q235B钢材', debitAmount: 280000, creditAmount: 0, auxData: '{"supplier":"上海宝钢","purchaseOrder":"PO-2026-001"}', sortOrder: 1 },
      { voucherId: savedVouchers[1].id, accountId: findAccount('1002')!, summary: '付宝钢钢材款', debitAmount: 0, creditAmount: 280000, auxData: '{"supplier":"上海宝钢"}', sortOrder: 2 },

      // V-003：标准件采购 → 借：原材料 35000，贷：银行存款 35000
      { voucherId: savedVouchers[2].id, accountId: findAccount('1403')!, summary: '购入标准件', debitAmount: 35000, creditAmount: 0, auxData: '{"supplier":"苏州标准件","purchaseOrder":"PO-2026-002"}', sortOrder: 1 },
      { voucherId: savedVouchers[2].id, accountId: findAccount('1002')!, summary: '付标准件采购款', debitAmount: 0, creditAmount: 35000, auxData: '{"supplier":"苏州标准件"}', sortOrder: 2 },

      // V-004：华东物流定金 → 借：银行存款 180000，贷：预收账款 180000
      { voucherId: savedVouchers[3].id, accountId: findAccount('1002')!, summary: '收华东物流定金', debitAmount: 180000, creditAmount: 0, auxData: '{"customer":"华东物流集团"}', sortOrder: 1 },
      { voucherId: savedVouchers[3].id, accountId: findAccount('2203')!, summary: '华东物流预收款', debitAmount: 0, creditAmount: 180000, auxData: '{"customer":"华东物流集团","contract":"CON-2026-002"}', sortOrder: 2 },

      // V-005：工资发放 → 借：应付职工薪酬 156000，贷：银行存款 156000
      { voucherId: savedVouchers[4].id, accountId: findAccount('2211')!, summary: '发放6月工资', debitAmount: 156000, creditAmount: 0, auxData: null, sortOrder: 1 },
      { voucherId: savedVouchers[4].id, accountId: findAccount('1002')!, summary: '工资银行转账', debitAmount: 0, creditAmount: 156000, auxData: null, sortOrder: 2 },

      // V-006（草稿）：配件销售 → 借：应收账款 85000，贷：主营业务收入 85000
      { voucherId: savedVouchers[5].id, accountId: findAccount('1122')!, summary: '南京仓储配件销售', debitAmount: 85000, creditAmount: 0, auxData: '{"customer":"南京仓储设备有限公司"}', sortOrder: 1 },
      { voucherId: savedVouchers[5].id, accountId: findAccount('6001')!, summary: '配件销售收入', debitAmount: 0, creditAmount: 85000, auxData: null, sortOrder: 2 },
    ];
    for (const ve of voucherEntries) {
      if (ve.accountId) {
        await voucherEntryRepo.save(voucherEntryRepo.create(ve));
      }
    }
    console.log(`  ✅ 创建 ${voucherEntries.length} 条凭证分录`);
  }

  // ─── M14 HR人力资源管理 ───
  const employeeRepo = dataSource.getRepository(Employee);
  if (await employeeRepo.count() === 0) {
    const employees = [
      { code: 'EMP202606001', name: '王建国', gender: 'male' as const, birthDate: new Date('1985-03-15'), idNumber: '320102198503151234', phone: '13812345678', email: 'wangjg@shelferp.com', hireDate: new Date('2020-06-01'), departmentId: undefined, departmentName: '生产部', position: '生产经理', status: 'active' as const, remark: '资深生产管理者', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606002', name: '李明华', gender: 'male' as const, birthDate: new Date('1990-08-20'), idNumber: '32010419900820123X', phone: '13987654321', email: 'limh@shelferp.com', hireDate: new Date('2021-03-15'), departmentId: undefined, departmentName: '技术部', position: '结构工程师', status: 'active' as const, remark: '负责悬臂货架设计', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606003', name: '张秀兰', gender: 'female' as const, birthDate: new Date('1992-05-10'), idNumber: '320106199205101234', phone: '13611112222', email: 'zhangxl@shelferp.com', hireDate: new Date('2022-01-10'), departmentId: undefined, departmentName: '销售部', position: '销售主管', status: 'active' as const, remark: '华东区销售负责人', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606004', name: '陈伟', gender: 'male' as const, birthDate: new Date('1988-11-25'), idNumber: '320111198811251234', phone: '13522223333', email: 'chenw@shelferp.com', hireDate: new Date('2021-07-01'), departmentId: undefined, departmentName: '采购部', position: '采购专员', status: 'active' as const, remark: '钢材与标准件采购', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606005', name: '刘美芳', gender: 'female' as const, birthDate: new Date('1995-02-18'), idNumber: '320113199502181234', phone: '13733334444', email: 'liumf@shelferp.com', hireDate: new Date('2023-03-01'), departmentId: undefined, departmentName: '财务部', position: '会计', status: 'active' as const, remark: '负责应收应付核算', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606006', name: '赵大强', gender: 'male' as const, birthDate: new Date('1993-09-08'), idNumber: '320115199309081234', phone: '13844445555', email: 'zhadq@shelferp.com', hireDate: new Date('2022-09-01'), departmentId: undefined, departmentName: '生产部', position: '焊接技师', status: 'active' as const, remark: '持有焊工证', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606007', name: '孙小明', gender: 'male' as const, birthDate: new Date('1998-04-12'), idNumber: '320106199804121234', phone: '13655556666', email: 'sunxm@shelferp.com', hireDate: new Date('2024-01-15'), departmentId: undefined, departmentName: '生产部', position: '冲压操作工', status: 'active' as const, remark: '新员工培训期', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606008', name: '周丽', gender: 'female' as const, birthDate: new Date('1991-12-03'), idNumber: '320104199112031234', phone: '13966667777', email: 'zhoul@shelferp.com', hireDate: new Date('2023-06-01'), departmentId: undefined, departmentName: '仓储部', position: '仓库管理员', status: 'active' as const, remark: '负责成品仓管理', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606009', name: '吴铁柱', gender: 'male' as const, birthDate: new Date('1986-07-20'), idNumber: '320102198607201234', phone: '13577778888', email: undefined, hireDate: new Date('2019-01-15'), departmentId: undefined, departmentName: '安装部', position: '安装队长', status: 'active' as const, remark: '5年安装经验', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606010', name: '何远志', gender: 'male' as const, birthDate: new Date('1997-01-30'), idNumber: '320111199701301234', phone: '13688889999', email: undefined, hireDate: new Date('2024-04-01'), departmentId: undefined, departmentName: '生产部', position: '喷塑操作工', status: 'active' as const, remark: '喷塑线新员工', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606011', name: '郑文辉', gender: 'male' as const, birthDate: new Date('1987-06-15'), idNumber: '320106198706151234', phone: '13711110000', email: 'zhengwh@shelferp.com', hireDate: new Date('2020-09-01'), departmentId: undefined, departmentName: '技术部', position: '技术总监', status: 'active' as const, remark: '全厂技术负责人', createdBy: adminId, updatedBy: adminId },
      { code: 'EMP202606012', name: '黄小燕', gender: 'female' as const, birthDate: new Date('1994-10-22'), idNumber: '320113199410221234', phone: '13822220000', email: 'huangxy@shelferp.com', hireDate: new Date('2022-05-01'), departmentId: undefined, departmentName: '行政部', position: '行政助理', status: 'active' as const, remark: 'HR兼行政', createdBy: adminId, updatedBy: adminId },
    ];
    const savedEmployees = await employeeRepo.save(employeeRepo.create(employees));
    console.log(`  ✅ 创建 ${savedEmployees.length} 名员工`);

    // 考勤记录（近一周）
    const attendanceRepo = dataSource.getRepository(AttendanceRecord);
    if (await attendanceRepo.count() === 0) {
      const attendanceDays = ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'];
      const attendanceData: Partial<AttendanceRecord>[] = [];
      for (const day of attendanceDays) {
        for (const emp of savedEmployees) {
          let status: string = 'normal';
          let clockIn = '08:30';
          let clockOut = '17:30';
          let overtimeHours: number | undefined = undefined;
          let leaveType: string | undefined = undefined;
          let skipClock = false;

          // 给某些员工设置特殊考勤
          if (emp.name === '孙小明' && day === '2026-06-18') { status = 'late'; clockIn = '09:15'; }
          if (emp.name === '赵大强' && day === '2026-06-20') { status = 'overtime'; overtimeHours = 2.5; clockOut = '19:30'; }
          if (emp.name === '张秀兰' && day === '2026-06-19') { status = 'leave'; leaveType = '事假'; skipClock = true; }
          if (emp.name === '何远志' && day === '2026-06-18') { status = 'absent'; skipClock = true; }

          attendanceData.push({
            employeeId: emp.id,
            employeeName: emp.name,
            recordDate: new Date(day),
            clockIn: skipClock ? '' : clockIn,
            clockOut: skipClock ? '' : clockOut,
            status: status as any,
            leaveType,
            overtimeHours,
            remark: undefined,
            createdBy: adminId,
            updatedBy: adminId,
          });
        }
      }
      await attendanceRepo.save(attendanceRepo.create(attendanceData));
      console.log(`  ✅ 创建 ${attendanceData.length} 条考勤记录`);
    }

    // 薪资记录（6月份）
    const salaryRepo = dataSource.getRepository(SalaryRecord);
    if (await salaryRepo.count() === 0) {
      const salaryData = [
        { employeeId: savedEmployees[0].id, employeeName: savedEmployees[0].name, salaryMonth: '2026-06', baseSalary: 12000, overtimePay: 0, bonus: 2000, allowance: 500, deduction: 0, socialInsurance: 1320, housingFund: 1200, actualAmount: 9980, status: 'approved' as const, remark: '6月工资', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[1].id, employeeName: savedEmployees[1].name, salaryMonth: '2026-06', baseSalary: 10000, overtimePay: 800, bonus: 1500, allowance: 300, deduction: 0, socialInsurance: 1100, housingFund: 1000, actualAmount: 11600, status: 'approved' as const, remark: '含项目加班', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[2].id, employeeName: savedEmployees[2].name, salaryMonth: '2026-06', baseSalary: 8500, overtimePay: 0, bonus: 3000, allowance: 200, deduction: 0, socialInsurance: 935, housingFund: 850, actualAmount: 10915, status: 'submitted' as const, remark: '含销售提成', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[5].id, employeeName: savedEmployees[5].name, salaryMonth: '2026-06', baseSalary: 7500, overtimePay: 1500, bonus: 500, allowance: 300, deduction: 200, socialInsurance: 825, housingFund: 750, actualAmount: 8525, status: 'draft' as const, remark: '加班工资待核实', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[10].id, employeeName: savedEmployees[10].name, salaryMonth: '2026-06', baseSalary: 15000, overtimePay: 0, bonus: 5000, allowance: 1000, deduction: 0, socialInsurance: 1650, housingFund: 1500, actualAmount: 17850, status: 'draft' as const, remark: '技术总监工资', createdBy: adminId, updatedBy: adminId },
      ];
      await salaryRepo.save(salaryRepo.create(salaryData));
      console.log(`  ✅ 创建 ${salaryData.length} 条薪资记录`);
    }

    // 培训记录
    const trainingRepo = dataSource.getRepository(TrainingRecord);
    if (await trainingRepo.count() === 0) {
      const trainingData = [
        { code: 'TRN202606001', title: '悬臂货架结构设计规范培训', trainer: '郑文辉', startDate: new Date('2026-06-10'), endDate: new Date('2026-06-12'), location: '公司会议室A', trainingType: 'internal', cost: 0, participantCount: 8, status: 'completed' as const, remark: '全员结构设计规范更新', createdBy: adminId, updatedBy: adminId },
        { code: 'TRN202606002', title: '焊接工艺质量提升培训', trainer: '外聘-南京焊接协会张教授', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-16'), location: '焊接车间培训区', trainingType: 'external', cost: 5000, participantCount: 4, status: 'completed' as const, remark: '4名焊工参加', createdBy: adminId, updatedBy: adminId },
        { code: 'TRN202606003', title: '安全生产月专题培训', trainer: '行政部-黄小燕', startDate: new Date('2026-06-25'), endDate: new Date('2026-06-26'), location: '公司大会议室', trainingType: 'safety', cost: 500, participantCount: 12, status: 'in_progress' as const, remark: '全厂安全月活动', createdBy: adminId, updatedBy: adminId },
        { code: 'TRN202606004', title: 'ERP系统操作培训', trainer: '系统管理员', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-02'), location: '线上会议室', trainingType: 'online', cost: 0, participantCount: 20, status: 'planned' as const, remark: '全员新系统上线培训', createdBy: adminId, updatedBy: adminId },
      ];
      await trainingRepo.save(trainingRepo.create(trainingData));
      console.log(`  ✅ 创建 ${trainingData.length} 条培训记录`);
    }

    // 绩效评估（Q2季度）
    const performanceRepo = dataSource.getRepository(PerformanceReview);
    if (await performanceRepo.count() === 0) {
      const performanceData = [
        { employeeId: savedEmployees[0].id, employeeName: savedEmployees[0].name, reviewPeriod: 'quarterly' as const, periodLabel: '2026-Q2', reviewerId: savedEmployees[10]?.id ?? undefined, reviewerName: '郑文辉', kpiScore: 88, attitudeScore: 90, skillScore: 85, totalScore: 87.67, status: 'confirmed' as const, remark: '生产效率达标', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[1].id, employeeName: savedEmployees[1].name, reviewPeriod: 'quarterly' as const, periodLabel: '2026-Q2', reviewerId: savedEmployees[10]?.id ?? undefined, reviewerName: '郑文辉', kpiScore: 92, attitudeScore: 85, skillScore: 95, totalScore: 90.67, status: 'confirmed' as const, remark: '设计能力突出', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[2].id, employeeName: savedEmployees[2].name, reviewPeriod: 'quarterly' as const, periodLabel: '2026-Q2', reviewerId: undefined, reviewerName: '销售总监', kpiScore: 95, attitudeScore: 88, skillScore: 80, totalScore: 87.67, status: 'reviewed' as const, remark: '销售业绩达标，客户满意度高', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[5].id, employeeName: savedEmployees[5].name, reviewPeriod: 'monthly' as const, periodLabel: '2026-06', reviewerId: savedEmployees[0]?.id ?? undefined, reviewerName: '王建国', kpiScore: 78, attitudeScore: 90, skillScore: 82, totalScore: 83.33, status: 'submitted' as const, remark: '焊接质量稳定', createdBy: adminId, updatedBy: adminId },
        { employeeId: savedEmployees[6].id, employeeName: savedEmployees[6].name, reviewPeriod: 'monthly' as const, periodLabel: '2026-06', reviewerId: savedEmployees[0]?.id ?? undefined, reviewerName: '王建国', kpiScore: 65, attitudeScore: 85, skillScore: 70, totalScore: 73.33, status: 'draft' as const, remark: '新员工，仍在适应期', createdBy: adminId, updatedBy: adminId },
      ];
      await performanceRepo.save(performanceRepo.create(performanceData));
      console.log(`  ✅ 创建 ${performanceData.length} 条绩效评估记录`);
    }
  }

  console.log('✅ 核心业务种子数据运行完成');

  // ─── M16 售后服务 ───
  const serviceTicketRepo = dataSource.getRepository(ServiceTicket);
  if (await serviceTicketRepo.count() === 0) {
    const customersInDb = await dataSource.getRepository(Customer).find();
    const tickets = [
      { ticketNo: 'SVC202606001', title: '华东物流横梁式货架螺丝松动维修', description: '3排横梁式货架有螺丝松动，需要紧固', serviceType: 'repair' as ServiceType, priority: 'high', status: 'processing' as ServiceTicketStatus, customerId: customersInDb[0]?.id || '', customerName: customersInDb[0]?.name || '华东物流集团', contactPhone: '13800001111', assignedTo: adminId, assignedToName: '吴铁柱', createdBy: adminId, updatedBy: adminId },
      { ticketNo: 'SVC202606002', title: '南京仓储设备安装验收后巡检', description: '新安装货架需要进行首次巡检', serviceType: 'maintain' as ServiceType, priority: 'medium', status: 'pending' as ServiceTicketStatus, customerId: customersInDb[1]?.id || '', customerName: customersInDb[1]?.name || '南京仓储设备有限公司', contactPhone: '13900002222', createdBy: adminId, updatedBy: adminId },
      { ticketNo: 'SVC202606003', title: '深圳前海配件销售后回访', description: '轻中型货架配件销售后使用回访', serviceType: 'consult' as ServiceType, priority: 'low', status: 'closed' as ServiceTicketStatus, customerId: customersInDb[3]?.id || '', customerName: customersInDb[3]?.name || '深圳前海供应链有限公司', contactPhone: '13600003333', assignedTo: adminId, assignedToName: '张秀兰', solution: '客户反馈使用正常，无问题', satisfactionScore: 5, createdBy: adminId, updatedBy: adminId },
    ];
    await serviceTicketRepo.save(serviceTicketRepo.create(tickets));
    console.log(`  ✅ 创建 ${tickets.length} 条服务工单`);
  }

  // ─── M16 维修管理 ───
  const repairRepo = dataSource.getRepository(Repair);
  if (await repairRepo.count() === 0) {
    const savedTickets = await serviceTicketRepo.find();
    const employeesInDb = await dataSource.getRepository(Employee).find();
    const repairs = [
      { repairNo: 'REP202606001', ticketId: savedTickets[0]?.id || '', equipmentId: '', equipmentName: '横梁式货架A区3排', faultDesc: '螺丝松动，需要紧固', faultLevel: 'medium' as FaultLevel, repairDesc: '已紧固所有松动螺丝，更换了2个损坏的螺栓', repairCost: 150, status: 'completed' as RepairStatus, repairBy: adminId, repairByName: '王建国', createdBy: adminId, updatedBy: adminId },
      { repairNo: 'REP202606002', ticketId: '', equipmentId: 'EQUIP-001', equipmentName: '焊接机器人A', faultDesc: '焊接头堵塞，影响焊接质量', faultLevel: 'high' as FaultLevel, repairDesc: '', repairCost: 0, status: 'processing' as RepairStatus, repairBy: employeesInDb[0]?.id || '', repairByName: '王建国', createdBy: adminId, updatedBy: adminId },
      { repairNo: 'REP202606003', ticketId: '', equipmentId: 'EQUIP-005', equipmentName: '横梁式货架B区2排', faultDesc: '横梁变形，需要更换', faultLevel: 'critical' as FaultLevel, repairDesc: '已下单采购新横梁，预计3天到货', repairCost: 2800, status: 'pending' as RepairStatus, createdBy: adminId, updatedBy: adminId },
    ];
    await repairRepo.save(repairRepo.create(repairs));
    console.log(`  ✅ 创建 ${repairs.length} 条维修记录`);
  }

  // ─── M16 巡检管理 ───
  const m16InspectionRepo = dataSource.getRepository(Inspection);
  if (await m16InspectionRepo.count() === 0) {
    const inspections = [
      { inspectionNo: 'INSP202606001', title: '2026年6月华东物流货架巡检', inspectionType: 'routine' as InspectionType, equipmentId: '', equipmentName: '华东物流全部货架', inspector: adminId, inspectorName: '吴铁柱', result: 'pass' as M16InspectionResult, status: 'completed' as InspectionStatus, inspectedAt: '2026-06-15', createdBy: adminId, updatedBy: adminId },
      { inspectionNo: 'INSP202606002', title: '南京仓储新安装货架验收巡检', inspectionType: 'acceptance' as InspectionType, equipmentId: '', equipmentName: '南京仓储新安装货架', inspector: adminId, inspectorName: '郑文辉', result: 'fail' as M16InspectionResult, issueDesc: '发现3处螺丝未拧紧，1处横梁轻微变形', handleSuggestion: '需重新紧固螺丝，更换变形横梁', status: 'exception' as InspectionStatus, inspectedAt: '2026-06-18', createdBy: adminId, updatedBy: adminId },
      { inspectionNo: 'INSP202606003', title: '深圳前海配件仓库巡检', inspectionType: 'routine' as InspectionType, equipmentId: '', equipmentName: '深圳前海配件仓库货架', inspector: '', inspectorName: '', result: 'pending' as M16InspectionResult, status: 'pending' as InspectionStatus, createdBy: adminId, updatedBy: adminId },
    ];
    await m16InspectionRepo.save(m16InspectionRepo.create(inspections));
    console.log(`  ✅ 创建 ${inspections.length} 条巡检记录`);
  }

  // ─── M16 客户回访 ───
  const returnVisitRepo = dataSource.getRepository(ReturnVisit);
  if (await returnVisitRepo.count() === 0) {
    const savedTickets = await serviceTicketRepo.find();
    const customersInDb = await dataSource.getRepository(Customer).find();
    const visits = [
      { visitNo: 'VIS202606001', ticketId: savedTickets[2]?.id || '', customerId: customersInDb[3]?.id || '', customerName: customersInDb[3]?.name || '深圳前海供应链有限公司', visitMethod: 'phone' as VisitMethod, satisfactionScore: 5, feedback: '对售后服务非常满意，响应及时，问题解决彻底', status: 'completed' as ReturnVisitStatus, visitedBy: adminId, visitedByName: '张秀兰', visitedAt: '2026-06-20', createdBy: adminId, updatedBy: adminId },
      { visitNo: 'VIS202606002', ticketId: '', customerId: customersInDb[0]?.id || '', customerName: customersInDb[0]?.name || '华东物流集团', visitMethod: 'onsite' as VisitMethod, satisfactionScore: 4, feedback: '整体满意，但希望维修响应速度能更快一些', status: 'completed' as ReturnVisitStatus, visitedBy: adminId, visitedByName: '吴铁柱', visitedAt: '2026-06-22', createdBy: adminId, updatedBy: adminId },
      { visitNo: 'VIS202606003', ticketId: '', customerId: customersInDb[1]?.id || '', customerName: customersInDb[1]?.name || '南京仓储设备有限公司', visitMethod: 'phone' as VisitMethod, status: 'pending' as ReturnVisitStatus, createdBy: adminId, updatedBy: adminId },
    ];
    await returnVisitRepo.save(returnVisitRepo.create(visits));
    console.log(`  ✅ 创建 ${visits.length} 条回访记录`);
  }

  // ─── M16 质保管理 ───
  const warrantyRepo = dataSource.getRepository(Warranty);
  if (await warrantyRepo.count() === 0) {
    const customersInDb = await dataSource.getRepository(Customer).find();
    const warranties = [
      { warrantyNo: 'WAR202606001', productId: 'PROD-001', productName: '横梁式货架（华东物流项目）', customerId: customersInDb[0]?.id || '', customerName: customersInDb[0]?.name || '华东物流集团', startDate: '2026-01-01', endDate: '2028-12-31', warrantyType: 'full' as WarrantyType, status: 'active' as WarrantyStatus, description: '整机质保3年，免费维修非人为损坏', createdBy: adminId, updatedBy: adminId },
      { warrantyNo: 'WAR202606002', productId: 'PROD-002', productName: '悬臂货架（南京仓储项目）', customerId: customersInDb[1]?.id || '', customerName: customersInDb[1]?.name || '南京仓储设备有限公司', startDate: '2026-03-01', endDate: '2027-03-01', warrantyType: 'parts' as WarrantyType, status: 'active' as WarrantyStatus, description: '主要部件质保1年', createdBy: adminId, updatedBy: adminId },
      { warrantyNo: 'WAR202606003', productId: 'PROD-003', productName: '轻中型货架（深圳前海项目）', customerId: customersInDb[3]?.id || '', customerName: customersInDb[3]?.name || '深圳前海供应链有限公司', startDate: '2025-01-01', endDate: '2025-12-31', warrantyType: 'full' as WarrantyType, status: 'expired' as WarrantyStatus, description: '质保已过期，可提供延保服务', createdBy: adminId, updatedBy: adminId },
    ];
    await warrantyRepo.save(warrantyRepo.create(warranties));
    console.log(`  ✅ 创建 ${warranties.length} 条质保记录`);
  }
  // ─── M17 BI商业智能 ───
  // 仪表板
  const dashboardRepo = dataSource.getRepository(Dashboard);
  if (await dashboardRepo.count() === 0) {
    const dashboards = [
      { dashboardNo: 'DASH202606001', name: '销售仪表板', description: '销售数据概览仪表板', type: 'sales' as any, layout: { cols: 12, rows: 8, compact: true }, widgets: [{ id: 'w1', type: 'kpi', title: '本月销售额', position: { x: 0, y: 0, w: 3, h: 2 } }, { id: 'w2', type: 'chart', title: '销售趋势', position: { x: 3, y: 0, w: 6, h: 4 } }], isPublic: true, createdBy: adminId, updatedBy: adminId },
      { dashboardNo: 'DASH202606002', name: '库存仪表板', description: '库存状态监控仪表板', type: 'inventory' as any, layout: { cols: 12, rows: 6, compact: true }, widgets: [{ id: 'w3', type: 'gauge', title: '库存周转率', position: { x: 0, y: 0, w: 4, h: 3 } }, { id: 'w4', type: 'table', title: '低库存预警', position: { x: 4, y: 0, w: 8, h: 3 } }], isPublic: true, createdBy: adminId, updatedBy: adminId },
      { dashboardNo: 'DASH202606003', name: '财务仪表板', description: '财务关键指标仪表板', type: 'finance' as any, layout: { cols: 12, rows: 10, compact: true }, widgets: [{ id: 'w5', type: 'kpi', title: '本月利润', position: { x: 0, y: 0, w: 3, h: 2 } }, { id: 'w6', type: 'chart', title: '收支趋势', position: { x: 3, y: 0, w: 9, h: 5 } }], isPublic: false, createdBy: adminId, updatedBy: adminId },
    ];
    await dashboardRepo.save(dashboardRepo.create(dashboards));
    console.log('  创建 ' + dashboards.length + ' 个仪表板');
  }

  // 报表
  const m17ReportRepo = dataSource.getRepository(Report);
  if (await m17ReportRepo.count() === 0) {
    const reports = [
      { reportNo: 'RPT202606001', name: '销售日报', description: '每日销售数据汇总报表', type: 'sales' as any, format: 'table' as any, sqlQuery: "SELECT date, SUM(amount) as total FROM m05_quotations WHERE status=\"accepted\" GROUP BY date", parameters: { dateRange: { type: 'daterange', label: '日期范围', required: true } }, columns: [{ field: 'date', label: '日期', width: 120 }, { field: 'total', label: '销售额', width: 150, align: 'right' }], filters: [], isPublic: true, isActive: true, createdBy: adminId, updatedBy: adminId },
      { reportNo: 'RPT202606002', name: '库存周转率报表', description: '库存周转分析报表', type: 'inventory' as any, format: 'chart' as any, sqlQuery: 'SELECT product_name, SUM(quantity_out)/AVG(quantity_in) as turnover FROM m11_inventories GROUP BY product_name', parameters: { period: { type: 'select', label: '统计周期', options: ['月度', '季度', '年度'], required: true } }, columns: [{ field: 'product_name', label: '产品名称', width: 200 }, { field: 'turnover', label: '周转率', width: 120 }], filters: [], chartConfig: { type: 'bar', xField: 'product_name', yField: 'turnover', color: '#1890ff' }, isPublic: true, isActive: true, createdBy: adminId, updatedBy: adminId },
      { reportNo: 'RPT202606003', name: '项目进度报表', description: '项目执行进度汇总', type: 'project' as any, format: 'table' as any, sqlQuery: 'SELECT p.name, p.status, COUNT(t.id) as task_count FROM m07_projects p LEFT JOIN m10_work_orders t ON p.id=t.project_id GROUP BY p.id', parameters: {}, columns: [{ field: 'name', label: '项目名称', width: 200 }, { field: 'status', label: '状态', width: 100 }, { field: 'task_count', label: '工单数量', width: 120 }], filters: [{ field: 'status', label: '状态', type: 'select', options: ['planning', 'in_progress', 'completed'] }], isPublic: false, isActive: true, createdBy: adminId, updatedBy: adminId },
    ];
    await m17ReportRepo.save(m17ReportRepo.create(reports));
    console.log('  创建 ' + reports.length + ' 个报表');
  }

  // KPI指标
  const kpiRepo = dataSource.getRepository(KPI);
  if (await kpiRepo.count() === 0) {
    const kpis = [
      { kpiNo: 'KPI202606001', name: '月度销售额', description: '每月销售总额', type: 'sales' as any, unit: 'amount' as any, calculation: "SUM(m05_quotations.amount) WHERE status=\"accepted\" AND MONTH(created_at)=MONTH(NOW())", target: 500000, actual: 385000, achievementRate: 77.0, trend: 'up' as any, trendValue: '+12%', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606002', name: '生产良品率', description: '生产质量检测良品率', type: 'project' as any, unit: 'percentage' as any, calculation: "COUNT(m10_quality_checks.id WHERE result=\"pass\")/COUNT(m10_quality_checks.id)*100", target: 98, actual: 96.5, achievementRate: 98.5, trend: 'flat' as any, trendValue: '+0.2%', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606003', name: '库存周转率', description: '库存周转次数', type: 'inventory' as any, unit: 'ratio' as any, calculation: 'SUM(m11_inventories.quantity_out)/AVG(m11_inventories.quantity_in)', target: 4, actual: 3.2, achievementRate: 80.0, trend: 'down' as any, trendValue: '-0.5', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606004', name: '客户满意度', description: '客户服务满意度评分', type: 'sales' as any, unit: 'percentage' as any, calculation: 'AVG(m16_return_visits.satisfaction_score)*20', target: 95, actual: 92, achievementRate: 96.8, trend: 'up' as any, trendValue: '+3', isActive: true, createdBy: adminId, updatedBy: adminId },
    ];
    await kpiRepo.save(kpiRepo.create(kpis));
    console.log('  创建 ' + kpis.length + ' 个KPI指标');
  }

  // 数据源
  const dataSourceRepo = dataSource.getRepository(M17DataSourceEntity);
  if (await dataSourceRepo.count() === 0) {
    const dataSources = [
      { sourceNo: 'DS202606001', name: '主数据库', description: '系统主数据库（SQLite）', type: 'sqlite' as any, connectionString: 'sqlite://shelf_erp.sqlite', config: { path: './shelf_erp.sqlite', readonly: false }, isActive: true, isDefault: true, lastTestAt: '2026-06-20 10:00:00', lastTestSuccess: true, createdBy: adminId, updatedBy: adminId },
      { sourceNo: 'DS202606002', name: 'Excel导入数据源', description: '用于导入Excel数据的数据源', type: 'excel' as any, connectionString: '', config: { allowExtensions: ['.xlsx', '.xls'], maxFileSize: '10MB' }, isActive: true, isDefault: false, lastTestAt: '2026-06-19 15:30:00', lastTestSuccess: true, createdBy: adminId, updatedBy: adminId },
      { sourceNo: 'DS202606003', name: 'API接口数据源', description: '外部API数据接口', type: 'api' as any, connectionString: 'https://api.example.com/data', config: { method: 'GET', headers: { 'Content-Type': 'application/json' }, timeout: 30000 }, isActive: false, isDefault: false, lastTestAt: '2026-06-18 09:00:00', lastTestSuccess: false, createdBy: adminId, updatedBy: adminId },
    ];
    await dataSourceRepo.save(dataSourceRepo.create(dataSources));
    console.log('  创建 ' + dataSources.length + ' 个数据源');
  }

  console.log('✅ 核心业务种子数据运行完成');

}

