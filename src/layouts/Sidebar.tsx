import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import OrgIcon from '@mui/icons-material/AccountTree';
import DictIcon from '@mui/icons-material/MenuBook';
import LogIcon from '@mui/icons-material/History';
import ConfigIcon from '@mui/icons-material/Tune';
import CustomerIcon from '@mui/icons-material/Store';
import KanbanIcon from '@mui/icons-material/ViewKanban';
import InquiryIcon from '@mui/icons-material/RequestQuote';
import FollowupIcon from '@mui/icons-material/FollowTheSigns';
import ShelfIcon from '@mui/icons-material/Inventory2';
import ConfigFormIcon from '@mui/icons-material/Build';
import BomResultIcon from '@mui/icons-material/ListAlt';
import SpecIcon from '@mui/icons-material/Straighten';
import QuoteCreateIcon from '@mui/icons-material/AddCard';
import QuoteListIcon from '@mui/icons-material/FormatListBulleted';
import VersionIcon from '@mui/icons-material/CompareArrows';
import ContractIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import ProjectIcon from '@mui/icons-material/Folder';
import GanttIcon from '@mui/icons-material/ViewTimeline';
import AlertIcon from '@mui/icons-material/Notifications';
import BomListIcon from '@mui/icons-material/Schema';
import AlternativeIcon from '@mui/icons-material/ChangeCircle';
import WorkOrderIcon from '@mui/icons-material/PrecisionManufacturing';
import ScheduleIcon from '@mui/icons-material/CalendarMonth';
import ScanIcon from '@mui/icons-material/QrCodeScanner';
import EquipmentIcon from '@mui/icons-material/PrecisionManufacturing';
import QualityIcon from '@mui/icons-material/FactCheck';
import OeeIcon from '@mui/icons-material/Speed';
import ProgressIcon from '@mui/icons-material/TrendingUp';
import ProcessRouteIcon from '@mui/icons-material/Route';
import MaterialIcon from '@mui/icons-material/LocalShipping';
import DefectIcon from '@mui/icons-material/BugReport';
import FinishedIcon from '@mui/icons-material/Input';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PdaIcon from '@mui/icons-material/Devices';
import BatchIcon from '@mui/icons-material/Layers';
import InventoryIcon from '@mui/icons-material/BarChart';
import CostIcon from '@mui/icons-material/Analytics';
import VarianceIcon from '@mui/icons-material/Difference';
import CostAlertIcon from '@mui/icons-material/Warning';
import FinanceIcon from '@mui/icons-material/AccountBalance';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VoucherIcon from '@mui/icons-material/Receipt';
import ReceivableIcon from '@mui/icons-material/RequestQuote';
import PayableIcon from '@mui/icons-material/PriceCheck';
import BankIcon from '@mui/icons-material/Savings';
import FundIcon from '@mui/icons-material/Assessment';
import HrIcon from '@mui/icons-material/Badge';
import EmpIcon from '@mui/icons-material/Person';
import AttIcon from '@mui/icons-material/AccessTime';
import SalIcon from '@mui/icons-material/AttachMoney';
import TrnIcon from '@mui/icons-material/School';
import PerfIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import CollapseIcon from '@mui/icons-material/ChevronLeft';
import ExpandIcon from '@mui/icons-material/ChevronRight';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorageIcon from '@mui/icons-material/Storage';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement;
  children?: NavItem[];
}

const NAV_CONFIG: NavItem[] = [
  { path: '/dashboard', label: '驾驶�?', icon: <DashboardIcon /> },
  {
    path: '/m01',
    label: '系统管理',
    icon: <SettingsIcon />,
    children: [
      { path: '/m01/org-structure', label: '组织架构', icon: <OrgIcon /> },
      { path: '/m01/users', label: '用户管理', icon: <PeopleIcon /> },
      { path: '/m01/roles', label: '角色权限', icon: <SecurityIcon /> },
      { path: '/m01/dictionary', label: '数据字典', icon: <DictIcon /> },
      { path: '/m01/logs', label: '系统日志', icon: <LogIcon /> },
      { path: '/m01/config', label: '系统配置', icon: <ConfigIcon /> },
    ],
  },
  {
    path: '/m02',
    label: '销售CRM',
    icon: <CustomerIcon />,
    children: [
      { path: '/m02/customers', label: '客户档案', icon: <CustomerIcon /> },
      { path: '/m02/opportunities', label: '商机看板', icon: <KanbanIcon /> },
      { path: '/m02/inquiries', label: '询价管理', icon: <InquiryIcon /> },
      { path: '/m02/followups', label: '跟进记录', icon: <FollowupIcon /> },
    ],
  },
  {
    path: '/m04',
    label: '货架配置�?',
    icon: <ShelfIcon />,
    children: [
      { path: '/m04/shelf-types', label: '类型�?', icon: <ShelfIcon /> },
      { path: '/m04/configure', label: '配置表单', icon: <ConfigFormIcon /> },
      { path: '/m04/bom-result', label: 'BOM结果', icon: <BomResultIcon /> },
      { path: '/m04/specifications', label: '规格匹配', icon: <SpecIcon /> },
    ],
  },
  {
    path: '/m05',
    label: '报价引擎',
    icon: <QuoteCreateIcon />,
    children: [
      { path: '/m05/quotations/create', label: '创建报价', icon: <QuoteCreateIcon /> },
      { path: '/m05/quotations', label: '报价列表', icon: <QuoteListIcon /> },
      { path: '/m05/quotations/compare', label: '版本对比', icon: <VersionIcon /> },
    ],
  },
  {
    path: '/m06',
    label: '合同管理',
    icon: <ContractIcon />,
    children: [
      { path: '/m06/contracts', label: '合同列表', icon: <ContractIcon /> },
      { path: '/m06/payments', label: '回款跟踪', icon: <PaymentIcon /> },
    ],
  },
  {
    path: '/m07',
    label: '项目管理',
    icon: <ProjectIcon />,
    children: [
      { path: '/m07/projects', label: '项目列表', icon: <ProjectIcon /> },
      { path: '/m07/gantt', label: '甘特�?', icon: <GanttIcon /> },
      { path: '/m07/alerts', label: '预警中心', icon: <AlertIcon /> },
    ],
  },
  {
    path: '/m08',
    label: 'BOM管理',
    icon: <BomListIcon />,
    children: [
      { path: '/m08/bom-list', label: 'BOM列表', icon: <BomListIcon /> },
      { path: '/m08/bom-versions', label: '版本管理', icon: <VersionIcon /> },
      { path: '/m08/alternatives', label: '替代�?', icon: <AlternativeIcon /> },
    ],
  },
  {
    path: '/m10',
    label: 'MES生产',
    icon: <WorkOrderIcon />,
    children: [
      { path: '/m10/work-orders', label: '工单管理', icon: <WorkOrderIcon /> },
      { path: '/m10/scheduling', label: '生产排程', icon: <ScheduleIcon /> },
      { path: '/m10/scan-report', label: '扫码报工', icon: <ScanIcon /> },
      { path: '/m10/equipment', label: '设备台账', icon: <EquipmentIcon /> },
      { path: '/m10/quality', label: '质检管理', icon: <QualityIcon /> },
      { path: '/m10/oee', label: 'OEE看板', icon: <OeeIcon /> },
      { path: '/m10/production-progress', label: '生产进度', icon: <ProgressIcon /> },
      { path: '/m10/process-routes', label: '工艺路线', icon: <ProcessRouteIcon /> },
      { path: '/m10/material-demand', label: '物料需�?', icon: <MaterialIcon /> },
      { path: '/m10/defects', label: '不良�?', icon: <DefectIcon /> },
      { path: '/m10/finished-goods', label: '成品入库', icon: <FinishedIcon /> },
    ],
  },
  {
    path: '/m11',
    label: '仓储管理',
    icon: <WarehouseIcon />,
    children: [
      { path: '/m11/warehouses', label: '仓库定义', icon: <WarehouseIcon /> },
      { path: '/m11/pda-scan', label: 'PDA扫码', icon: <PdaIcon /> },
      { path: '/m11/batches', label: '批次管理', icon: <BatchIcon /> },
      { path: '/m11/inventory', label: '库存看板', icon: <InventoryIcon /> },
    ],
  },
  {
    path: '/m12',
    label: '成本核算',
    icon: <CostIcon />,
    children: [
      { path: '/m12/cost-analysis', label: '成本分析', icon: <CostIcon /> },
      { path: '/m12/variance', label: '差异分析', icon: <VarianceIcon /> },
      { path: '/m12/cost-alerts', label: '成本预警', icon: <CostAlertIcon /> },
    ],
  },
  {
    path: '/m13',
    label: '财务总账',
    icon: <FinanceIcon />,
    children: [
      { path: '/m13/accounts', label: '科目管理', icon: <AccountTreeIcon /> },
      { path: '/m13/vouchers', label: '凭证管理', icon: <VoucherIcon /> },
      { path: '/m13/receivables', label: '应收管理', icon: <ReceivableIcon /> },
      { path: '/m13/payables', label: '应付管理', icon: <PayableIcon /> },
      { path: '/m13/bank-accounts', label: '银行账户', icon: <BankIcon /> },
      { path: '/m13/fund-reports', label: '资金日报', icon: <FundIcon /> },
    ],
  },
  {
    path: '/m14',
    label: 'HR人力',
    icon: <HrIcon />,
    children: [
      { path: '/m14/employees', label: '员工管理', icon: <EmpIcon /> },
      { path: '/m14/attendance', label: '考勤管理', icon: <AttIcon /> },
      { path: '/m14/salary', label: '薪酬管理', icon: <SalIcon /> },
      { path: '/m14/training', label: '培训管理', icon: <TrnIcon /> },
      { path: '/m14/performance', label: '绩效评估', icon: <PerfIcon /> },
    ],
  },
  {
    path: '/m16',
    label: '售后服务',
    icon: <BuildIcon />,
    children: [
      { path: '/m16/service-tickets', label: '服务工单', icon: <BuildIcon /> },
      { path: '/m16/repairs', label: '维修管理', icon: <BuildIcon /> },
      { path: '/m16/inspections', label: 'Ѳ�����', icon: <SearchIcon /> },
      { path: '/m16/return-visits', label: '�ͻ��ط�', icon: <CallIcon /> },
      { path: '/m16/warranties', label: '�ʱ�����', icon: <SecurityIcon /> },
    ],
  },
  {
    path: '/m17',
    label: 'BI商业智能',
    icon: <BarChartIcon />,
    children: [
      { path: '/m17/dashboards', label: '仪表�?', icon: <DashboardIcon /> },
      { path: '/m17/reports', label: '报表管理', icon: <AssessmentIcon /> },
      { path: '/m17/kpis', label: 'KPI指标', icon: <BarChartIcon /> },
      { path: '/m17/data-sources', label: '数据�?', icon: <StorageIcon /> },
    ],
  },
];

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 64;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const toggleGroup = (path: string) => {
    setOpenGroup((prev) => (prev === path ? null : path));
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          overflowX: 'hidden',
          transition: 'width 0.2s',
          bgcolor: '#003D6B',
          color: '#FFFFFF',
        },
      }}
    >
      {/* Logo�? */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {!collapsed && (
          <Box sx={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>货架ERP</Box>
        )}
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: '#FFF' }}>
          {collapsed ? <ExpandIcon /> : <CollapseIcon />}
        </IconButton>
      </Box>

      {/* 导航列表 */}
      <List sx={{ py: 1 }} component="nav">
        {NAV_CONFIG.map((item) => {
          if (!item.children) {
            return (
              <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 0 : 2,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            );
          }

          /* 分组�? */
          const isOpen = openGroup === item.path;
          return (
            <Box key={item.path}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => (collapsed ? navigate(item.children![0].path) : toggleGroup(item.path))}
                  selected={!collapsed && isOpen}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 0 : 2,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>

              {/* 子菜�? */}
              {!collapsed && isOpen && (
                <List disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      onClick={() => navigate(child.path)}
                      selected={isActive(child.path)}
                      sx={{
                        ml: 3,
                        borderRadius: 1,
                        mb: 0.25,
                        '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        py: 0.75,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}
