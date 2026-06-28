import { Suspense, Component, type ErrorInfo, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { lazyLoad } from './lazy';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import { useAuthStore } from '@/stores/useAuthStore';

/* ─── 懒加载错误边界 ─── */
interface EBState { error: Error | null }
class LazyErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[LazyErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">页面加载失败</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {this.state.error.message}
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => { this.setState({ error: null }); window.location.reload(); }}>
            刷新重试
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

/* ─── 页面懒加载 ─── */
const LoginPage = lazyLoad(() => import('@/pages/login/LoginPage'));
const DashboardPage = lazyLoad(() => import('@/pages/dashboard/DashboardPage'));
const NotFound = lazyLoad(() => import('@/pages/NotFound'));

/* M01 系统管理 */
const OrgStructurePage = lazyLoad(() => import('@/pages/m01/OrgStructurePage'));
const UserListPage = lazyLoad(() => import('@/pages/m01/UserListPage'));
const RolePermissionPage = lazyLoad(() => import('@/pages/m01/RolePermissionPage'));
const DictionaryPage = lazyLoad(() => import('@/pages/m01/DictionaryPage'));
const SystemLogPage = lazyLoad(() => import('@/pages/m01/SystemLogPage'));
const SystemConfigPage = lazyLoad(() => import('@/pages/m01/SystemConfigPage'));

/* M02 销售CRM */
const CustomerListPage = lazyLoad(() => import('@/pages/m02/CustomerListPage'));
const CustomerDetailPage = lazyLoad(() => import('@/pages/m02/CustomerDetailPage'));
const OpportunityKanbanPage = lazyLoad(() => import('@/pages/m02/OpportunityKanbanPage'));
const InquiryPage = lazyLoad(() => import('@/pages/m02/InquiryPage'));
const FollowupPage = lazyLoad(() => import('@/pages/m02/FollowupPage'));

/* M03 方案设计+图文档 */
const SchemeListPage = lazyLoad(() => import('@/pages/m03/SchemeListPage'));
const SchemeDetailPage = lazyLoad(() => import('@/pages/m03/SchemeDetailPage'));
const SchemeDesignPage = lazyLoad(() => import('@/pages/m03/SchemeDesignPage'));
const DrawingManagePage = lazyLoad(() => import('@/pages/m03/DrawingManagePage'));

/* M04 货架配置器 */
const ShelfTypeLibPage = lazyLoad(() => import('@/pages/m04/ShelfTypeLibPage'));
const ConfigFormPage = lazyLoad(() => import('@/pages/m04/ConfigFormPage'));
const BomResultPage = lazyLoad(() => import('@/pages/m04/BomResultPage'));
const SpecMatchPage = lazyLoad(() => import('@/pages/m04/SpecMatchPage'));

/* M05 报价引擎 */
const QuotationCreatePage = lazyLoad(() => import('@/pages/m05/QuotationCreatePage'));
const QuotationListPage = lazyLoad(() => import('@/pages/m05/QuotationListPage'));
const VersionComparePage = lazyLoad(() => import('@/pages/m05/VersionComparePage'));

/* M06 合同管理 */
const ContractListPage = lazyLoad(() => import('@/pages/m06/ContractListPage'));
const ContractDetailPage = lazyLoad(() => import('@/pages/m06/ContractDetailPage'));
const PaymentTrackPage = lazyLoad(() => import('@/pages/m06/PaymentTrackPage'));

/* M07 项目管理 */
const ProjectListPage = lazyLoad(() => import('@/pages/m07/ProjectListPage'));
const ProjectBoardPage = lazyLoad(() => import('@/pages/m07/ProjectBoardPage'));
const GanttPage = lazyLoad(() => import('@/pages/m07/GanttPage'));
const AlertCenterPage = lazyLoad(() => import('@/pages/m07/AlertCenterPage'));

/* M08 BOM管理 */
const BomListPage = lazyLoad(() => import('@/pages/m08/BomListPage'));
const BomDetailPage = lazyLoad(() => import('@/pages/m08/BomDetailPage'));
const BomVersionPage = lazyLoad(() => import('@/pages/m08/BomVersionPage'));
const AlternativeMaterialPage = lazyLoad(() => import('@/pages/m08/AlternativeMaterialPage'));

/* M09 采购管理 */
const PurchaseOrderListPage = lazyLoad(() => import('@/pages/m09/PurchaseOrderListPage'));
const PurchaseOrderDetailPage = lazyLoad(() => import('@/pages/m09/PurchaseOrderDetailPage'));
const SupplierManagePage = lazyLoad(() => import('@/pages/m09/SupplierManagePage'));
const PriceQuotePage = lazyLoad(() => import('@/pages/m09/PriceQuotePage'));

/* M10 MES生产 */
const WorkOrderListPage = lazyLoad(() => import('@/pages/m10/WorkOrderListPage'));
const WorkOrderDetailPage = lazyLoad(() => import('@/pages/m10/WorkOrderDetailPage'));
const SchedulePage = lazyLoad(() => import('@/pages/m10/SchedulePage'));
const ScanReportPage = lazyLoad(() => import('@/pages/m10/ScanReportPage'));
const EquipmentPage = lazyLoad(() => import('@/pages/m10/EquipmentPage'));
const QualityPage = lazyLoad(() => import('@/pages/m10/QualityPage'));
const OeeDashboardPage = lazyLoad(() => import('@/pages/m10/OeeDashboardPage'));
const ProductionProgressPage = lazyLoad(() => import('@/pages/m10/ProductionProgressPage'));
const ProcessRoutePage = lazyLoad(() => import('@/pages/m10/ProcessRoutePage'));
const MaterialDemandPage = lazyLoad(() => import('@/pages/m10/MaterialDemandPage'));
const DefectPage = lazyLoad(() => import('@/pages/m10/DefectPage'));
const FinishedGoodsPage = lazyLoad(() => import('@/pages/m10/FinishedGoodsPage'));

/* M15 安装管理 */
const InstallPlanListPage = lazyLoad(() => import('@/pages/m15/InstallPlanListPage'));
const InstallPlanDetailPage = lazyLoad(() => import('@/pages/m15/InstallPlanDetailPage'));
const InstallReportPage = lazyLoad(() => import('@/pages/m15/InstallReportPage'));
const InstallIssuePage = lazyLoad(() => import('@/pages/m15/InstallIssuePage'));
const AcceptancePage = lazyLoad(() => import('@/pages/m15/AcceptancePage'));
const InstallMobilePage = lazyLoad(() => import('@/pages/m15/InstallMobilePage'));
const AcceptanceSignPage = lazyLoad(() => import('@/pages/m15/AcceptanceSignPage'));

/* M11 仓储管理 */
const WarehouseDefinePage = lazyLoad(() => import('@/pages/m11/WarehouseDefinePage'));
const PdaScanPage = lazyLoad(() => import('@/pages/m11/PdaScanPage'));
const BatchManagePage = lazyLoad(() => import('@/pages/m11/BatchManagePage'));
const InventoryDashboardPage = lazyLoad(() => import('@/pages/m11/InventoryDashboardPage'));

/* M12 成本核算 */
const CostAnalysisPage = lazyLoad(() => import('@/pages/m12/CostAnalysisPage'));
const VariancePage = lazyLoad(() => import('@/pages/m12/VariancePage'));
const CostAlertPage = lazyLoad(() => import('@/pages/m12/CostAlertPage'));

/* M13 财务总账 */
const AccountListPage = lazyLoad(() => import('@/pages/m13/AccountListPage'));
const VoucherListPage = lazyLoad(() => import('@/pages/m13/VoucherListPage'));
const VoucherEntryPage = lazyLoad(() => import('@/pages/m13/VoucherEntryPage'));
const ReceivableListPage = lazyLoad(() => import('@/pages/m13/ReceivableListPage'));
const PayableListPage = lazyLoad(() => import('@/pages/m13/PayableListPage'));
const BankAccountPage = lazyLoad(() => import('@/pages/m13/BankAccountPage'));
const FundDailyReportPage = lazyLoad(() => import('@/pages/m13/FundDailyReportPage'));
const FixedAssetPage = lazyLoad(() => import('@/pages/m13/FixedAssetPage'));
const ExpensePage = lazyLoad(() => import('@/pages/m13/ExpensePage'));
const InvoicePage = lazyLoad(() => import('@/pages/m13/InvoicePage'));

/* M14 HR人力资源管理 */
const EmployeeListPage = lazyLoad(() => import('@/pages/m14/EmployeeListPage'));
const AttendancePage = lazyLoad(() => import('@/pages/m14/AttendancePage'));
const SalaryPage = lazyLoad(() => import('@/pages/m14/SalaryPage'));
const TrainingPage = lazyLoad(() => import('@/pages/m14/TrainingPage'));
const PerformancePage = lazyLoad(() => import('@/pages/m14/PerformancePage'));

/* M16 售后服务 */
const ServiceTicketListPage = lazyLoad(() => import('@/pages/m16/ServiceTicketListPage'));
const RepairListPage = lazyLoad(() => import('@/pages/m16/RepairListPage'));
const InspectionListPage = lazyLoad(() => import('@/pages/m16/InspectionListPage'));
const ReturnVisitListPage = lazyLoad(() => import('@/pages/m16/ReturnVisitListPage'));
const WarrantyListPage = lazyLoad(() => import('@/pages/m16/WarrantyListPage'));

/* M17 BI商业智能 */
const DashboardListPage = lazyLoad(() => import('@/pages/m17/DashboardListPage'));
const ReportListPage = lazyLoad(() => import('@/pages/m17/ReportListPage'));
const KpiListPage = lazyLoad(() => import('@/pages/m17/KpiListPage'));
const DataSourceListPage = lazyLoad(() => import('@/pages/m17/DataSourceListPage'));
const ProductionDashboardPage = lazyLoad(() => import('@/pages/m17/ProductionDashboardPage'));
const CEODashboardPage = lazyLoad(() => import('@/pages/m17/CEODashboardPage'));

/* M18 AI智能报价 */
const AiQuotationPage = lazyLoad(() => import('@/pages/m18/AiQuotationPage'));

/* M19 AI智能排产 */
const AiSchedulePage = lazyLoad(() => import('@/pages/m19/AiSchedulePage'));

/* M20 AI成本预测 */
const AiCostPredictionPage = lazyLoad(() => import('@/pages/m20/AiCostPredictionPage'));

/* M11 库存看板 */
const InventoryKanbanPage = lazyLoad(() => import('@/pages/m11/InventoryKanbanPage'));

/* ─── Loading Fallback ─── */
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress size={32} />
  </Box>
);

/* ─── 路由守卫 ─── */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/* ─── 路由配置 ─── */
export default function AppRouter() {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
        {/* 登录 */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 主框架 */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* M01 系统管理 */}
          <Route path="/m01/org-structure" element={<OrgStructurePage />} />
          <Route path="/m01/users" element={<UserListPage />} />
          <Route path="/m01/roles" element={<RolePermissionPage />} />
          <Route path="/m01/dictionary" element={<DictionaryPage />} />
          <Route path="/m01/logs" element={<SystemLogPage />} />
          <Route path="/m01/config" element={<SystemConfigPage />} />

          {/* M02 销售CRM */}
          <Route path="/m02/customers" element={<CustomerListPage />} />
          <Route path="/m02/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/m02/opportunities" element={<OpportunityKanbanPage />} />
          <Route path="/m02/inquiries" element={<InquiryPage />} />
          <Route path="/m02/followups" element={<FollowupPage />} />

          {/* M03 方案设计+图文档 */}
          <Route path="/m03/schemes" element={<SchemeListPage />} />
          <Route path="/m03/schemes/:id" element={<SchemeDetailPage />} />
          <Route path="/m03/schemes-design" element={<SchemeDesignPage />} />
          <Route path="/m03/drawings" element={<DrawingManagePage />} />

          {/* M04 货架配置器 */}
          <Route path="/m04/shelf-types" element={<ShelfTypeLibPage />} />
          <Route path="/m04/configure" element={<ConfigFormPage />} />
          <Route path="/m04/bom-result" element={<BomResultPage />} />
          <Route path="/m04/specifications" element={<SpecMatchPage />} />

          {/* M05 报价引擎 */}
          <Route path="/m05/quotations/create" element={<QuotationCreatePage />} />
          <Route path="/m05/quotations" element={<QuotationListPage />} />
          <Route path="/m05/quotations/compare" element={<VersionComparePage />} />

          {/* M06 合同管理 */}
          <Route path="/m06/contracts" element={<ContractListPage />} />
          <Route path="/m06/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/m06/payments" element={<PaymentTrackPage />} />

          {/* M07 项目管理 */}
          <Route path="/m07/projects" element={<ProjectListPage />} />
          <Route path="/m07/projects/:id/board" element={<ProjectBoardPage />} />
          <Route path="/m07/gantt" element={<GanttPage />} />
          <Route path="/m07/alerts" element={<AlertCenterPage />} />

          {/* M08 BOM管理 */}
          <Route path="/m08/bom-list" element={<BomListPage />} />
          <Route path="/m08/bom/:id" element={<BomDetailPage />} />
          <Route path="/m08/bom-versions" element={<BomVersionPage />} />
          <Route path="/m08/alternatives" element={<AlternativeMaterialPage />} />

          {/* M09 采购管理 */}
          <Route path="/m09/purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="/m09/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
          <Route path="/m09/suppliers" element={<SupplierManagePage />} />
          <Route path="/m09/price-quotes" element={<PriceQuotePage />} />

          {/* M10 MES生产 */}
          <Route path="/m10/work-orders" element={<WorkOrderListPage />} />
          <Route path="/m10/work-orders/:id" element={<WorkOrderDetailPage />} />
          <Route path="/m10/scheduling" element={<SchedulePage />} />
          <Route path="/m10/scan-report" element={<ScanReportPage />} />
          <Route path="/m10/equipment" element={<EquipmentPage />} />
          <Route path="/m10/quality" element={<QualityPage />} />
          <Route path="/m10/oee" element={<OeeDashboardPage />} />
          <Route path="/m10/production-progress" element={<ProductionProgressPage />} />
          <Route path="/m10/process-routes" element={<ProcessRoutePage />} />
          <Route path="/m10/material-demand" element={<MaterialDemandPage />} />
          <Route path="/m10/defects" element={<DefectPage />} />
          <Route path="/m10/finished-goods" element={<FinishedGoodsPage />} />

          {/* M15 安装管理 */}
          <Route path="/m15/plans" element={<InstallPlanListPage />} />
          <Route path="/m15/plans/:id" element={<InstallPlanDetailPage />} />
          <Route path="/m15/reports" element={<InstallReportPage />} />
          <Route path="/m15/issues" element={<InstallIssuePage />} />
          <Route path="/m15/acceptances" element={<AcceptancePage />} />
          <Route path="/m15/pda-report" element={<InstallMobilePage />} />
          <Route path="/m15/acceptance-sign/:id" element={<AcceptanceSignPage />} />

          {/* M11 仓储管理 */}
          <Route path="/m11/warehouses" element={<WarehouseDefinePage />} />
          <Route path="/m11/pda-scan" element={<PdaScanPage />} />
          <Route path="/m11/batches" element={<BatchManagePage />} />
          <Route path="/m11/inventory" element={<InventoryDashboardPage />} />

          {/* M12 成本核算 */}
          <Route path="/m12/cost-analysis" element={<CostAnalysisPage />} />
          <Route path="/m12/variance" element={<VariancePage />} />
          <Route path="/m12/cost-alerts" element={<CostAlertPage />} />

          {/* M13 财务总账 */}
          <Route path="/m13/accounts" element={<AccountListPage />} />
          <Route path="/m13/vouchers" element={<VoucherListPage />} />
          <Route path="/m13/vouchers/new" element={<VoucherEntryPage />} />
          <Route path="/m13/receivables" element={<ReceivableListPage />} />
          <Route path="/m13/payables" element={<PayableListPage />} />
          <Route path="/m13/bank-accounts" element={<BankAccountPage />} />
          <Route path="/m13/fund-reports" element={<FundDailyReportPage />} />
          <Route path="/m13/fixed-assets" element={<FixedAssetPage />} />
          <Route path="/m13/expenses" element={<ExpensePage />} />
          <Route path="/m13/invoices" element={<InvoicePage />} />

          {/* M14 HR人力资源管理 */}
          <Route path="/m14/employees" element={<EmployeeListPage />} />
          <Route path="/m14/attendance" element={<AttendancePage />} />
          <Route path="/m14/salary" element={<SalaryPage />} />
          <Route path="/m14/training" element={<TrainingPage />} />
          <Route path="/m14/performance" element={<PerformancePage />} />

          {/* M16 售后服务 */}
          <Route path="/m16/service-tickets" element={<ServiceTicketListPage />} />
          <Route path="/m16/repairs" element={<RepairListPage />} />
          <Route path="/m16/inspections" element={<InspectionListPage />} />
          <Route path="/m16/return-visits" element={<ReturnVisitListPage />} />
          <Route path="/m16/warranties" element={<WarrantyListPage />} />

          {/* M17 BI商业智能 */}
          <Route path="/m17/dashboards" element={<DashboardListPage />} />
          <Route path="/m17/reports" element={<ReportListPage />} />
          <Route path="/m17/kpis" element={<KpiListPage />} />
          <Route path="/m17/data-sources" element={<DataSourceListPage />} />
          <Route path="/m17/dashboard/production" element={<ProductionDashboardPage />} />
          <Route path="/m17/dashboard/ceo" element={<CEODashboardPage />} />

          {/* M18 AI智能报价 */}
          <Route path="/m18/ai-quotation" element={<AiQuotationPage />} />

          {/* M19 AI智能排产 */}
          <Route path="/m19/ai-schedule" element={<AiSchedulePage />} />

          {/* M20 AI成本预测 */}
          <Route path="/m20/ai-cost-prediction" element={<AiCostPredictionPage />} />

          {/* M11 库存看板 */}
          <Route path="/m11/inventory-kanban" element={<InventoryKanbanPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </LazyErrorBoundary>
  );
}
