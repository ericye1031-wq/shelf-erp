import { readFileSync, writeFileSync } from 'fs';
const filePath = process.argv[2] || 'src/database/seeds/business-seed.ts';
const content = readFileSync(filePath, 'utf8');

// M17种子数据
const m17Seed = `
  // ─── M17 BI商业智能 ───
  // 仪表板
  const dashboardRepo = dataSource.getRepository(Dashboard);
  if (await dashboardRepo.count() === 0) {
    const dashboards = [
      { dashboardNo: 'DASH202606001', name: '销售仪表板', description: '销售数据概览仪表板', type: 'sales', layout: { cols: 12, rows: 8, compact: true }, widgets: [{ id: 'w1', type: 'kpi', title: '本月销售额', position: { x: 0, y: 0, w: 3, h: 2 } }, { id: 'w2', type: 'chart', title: '销售趋势', position: { x: 3, y: 0, w: 6, h: 4 } }], isPublic: true, createdBy: adminId, updatedBy: adminId },
      { dashboardNo: 'DASH202606002', name: '库存仪表板', description: '库存状态监控仪表板', type: 'inventory', layout: { cols: 12, rows: 6, compact: true }, widgets: [{ id: 'w3', type: 'gauge', title: '库存周转率', position: { x: 0, y: 0, w: 4, h: 3 } }, { id: 'w4', type: 'table', title: '低库存预警', position: { x: 4, y: 0, w: 8, h: 3 } }], isPublic: true, createdBy: adminId, updatedBy: adminId },
      { dashboardNo: 'DASH202606003', name: '财务仪表板', description: '财务关键指标仪表板', type: 'finance', layout: { cols: 12, rows: 10, compact: true }, widgets: [{ id: 'w5', type: 'kpi', title: '本月利润', position: { x: 0, y: 0, w: 3, h: 2 } }, { id: 'w6', type: 'chart', title: '收支趋势', position: { x: 3, y: 0, w: 9, h: 5 } }], isPublic: false, createdBy: adminId, updatedBy: adminId },
    ];
    await dashboardRepo.save(dashboardRepo.create(dashboards));
    console.log('  创建 ' + dashboards.length + ' 个仪表板');
  }

  // 报表
  const reportRepo = dataSource.getRepository(Report);
  if (await reportRepo.count() === 0) {
    const reports = [
      { reportNo: 'RPT202606001', name: '销售日报', description: '每日销售数据汇总报表', type: 'sales', format: 'table', sqlQuery: "SELECT date, SUM(amount) as total FROM m05_quotations WHERE status=\\"accepted\\" GROUP BY date", parameters: { dateRange: { type: 'daterange', label: '日期范围', required: true } }, columns: [{ field: 'date', label: '日期', width: 120 }, { field: 'total', label: '销售额', width: 150, align: 'right' }], filters: [], isPublic: true, isActive: true, createdBy: adminId, updatedBy: adminId },
      { reportNo: 'RPT202606002', name: '库存周转率报表', description: '库存周转分析报表', type: 'inventory', format: 'chart', sqlQuery: 'SELECT product_name, SUM(quantity_out)/AVG(quantity_in) as turnover FROM m11_inventories GROUP BY product_name', parameters: { period: { type: 'select', label: '统计周期', options: ['月度', '季度', '年度'], required: true } }, columns: [{ field: 'product_name', label: '产品名称', width: 200 }, { field: 'turnover', label: '周转率', width: 120 }], filters: [], chartConfig: { type: 'bar', xField: 'product_name', yField: 'turnover', color: '#1890ff' }, isPublic: true, isActive: true, createdBy: adminId, updatedBy: adminId },
      { reportNo: 'RPT202606003', name: '项目进度报表', description: '项目执行进度汇总', type: 'project', format: 'table', sqlQuery: 'SELECT p.name, p.status, COUNT(t.id) as task_count FROM m07_projects p LEFT JOIN m10_work_orders t ON p.id=t.project_id GROUP BY p.id', parameters: {}, columns: [{ field: 'name', label: '项目名称', width: 200 }, { field: 'status', label: '状态', width: 100 }, { field: 'task_count', label: '工单数量', width: 120 }], filters: [{ field: 'status', label: '状态', type: 'select', options: ['planning', 'in_progress', 'completed'] }], isPublic: false, isActive: true, createdBy: adminId, updatedBy: adminId },
    ];
    await reportRepo.save(reportRepo.create(reports));
    console.log('  创建 ' + reports.length + ' 个报表');
  }

  // KPI指标
  const kpiRepo = dataSource.getRepository(KPI);
  if (await kpiRepo.count() === 0) {
    const kpis = [
      { kpiNo: 'KPI202606001', name: '月度销售额', description: '每月销售总额', type: 'sales', unit: 'amount', calculation: "SUM(m05_quotations.amount) WHERE status=\\"accepted\\" AND MONTH(created_at)=MONTH(NOW())", target: 500000, actual: 385000, achievementRate: 77.0, trend: 'up', trendValue: '+12%', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606002', name: '生产良品率', description: '生产质量检测良品率', type: 'project', unit: 'percentage', calculation: "COUNT(m10_quality_checks.id WHERE result=\\"pass\\")/COUNT(m10_quality_checks.id)*100", target: 98, actual: 96.5, achievementRate: 98.5, trend: 'flat', trendValue: '+0.2%', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606003', name: '库存周转率', description: '库存周转次数', type: 'inventory', unit: 'ratio', calculation: 'SUM(m11_inventories.quantity_out)/AVG(m11_inventories.quantity_in)', target: 4, actual: 3.2, achievementRate: 80.0, trend: 'down', trendValue: '-0.5', isActive: true, createdBy: adminId, updatedBy: adminId },
      { kpiNo: 'KPI202606004', name: '客户满意度', description: '客户服务满意度评分', type: 'sales', unit: 'percentage', calculation: 'AVG(m16_return_visits.satisfaction_score)*20', target: 95, actual: 92, achievementRate: 96.8, trend: 'up', trendValue: '+3', isActive: true, createdBy: adminId, updatedBy: adminId },
    ];
    await kpiRepo.save(kpiRepo.create(kpis));
    console.log('  创建 ' + kpis.length + ' 个KPI指标');
  }

  // 数据源
  const dataSourceRepo = dataSource.getRepository(M17DataSourceEntity);
  if (await dataSourceRepo.count() === 0) {
    const dataSources = [
      { sourceNo: 'DS202606001', name: '主数据库', description: '系统主数据库（SQLite）', type: 'sqlite', connectionString: 'sqlite://shelf_erp.sqlite', config: { path: './shelf_erp.sqlite', readonly: false }, isActive: true, isDefault: true, lastTestAt: '2026-06-20 10:00:00', lastTestSuccess: true, createdBy: adminId, updatedBy: adminId },
      { sourceNo: 'DS202606002', name: 'Excel导入数据源', description: '用于导入Excel数据的数据源', type: 'excel', connectionString: '', config: { allowExtensions: ['.xlsx', '.xls'], maxFileSize: '10MB' }, isActive: true, isDefault: false, lastTestAt: '2026-06-19 15:30:00', lastTestSuccess: true, createdBy: adminId, updatedBy: adminId },
      { sourceNo: 'DS202606003', name: 'API接口数据源', description: '外部API数据接口', type: 'api', connectionString: 'https://api.example.com/data', config: { method: 'GET', headers: { 'Content-Type': 'application/json' }, timeout: 30000 }, isActive: false, isDefault: false, lastTestAt: '2026-06-18 09:00:00', lastTestSuccess: false, createdBy: adminId, updatedBy: adminId },
    ];
    await dataSourceRepo.save(dataSourceRepo.create(dataSources));
    console.log('  创建 ' + dataSources.length + ' 个数据源');
  }

  console.log('✅ 核心业务种子数据运行完成');
`;

// 在最后一个 } 之前插入
const lastBraceIndex = content.lastIndexOf('\n}');
if (lastBraceIndex === -1) {
  console.error('未找到函数结束的 }');
  process.exit(1);
}

const newContent = content.slice(0, lastBraceIndex) + m17Seed + content.slice(lastBraceIndex);
writeFileSync(filePath, newContent, 'utf8');
console.log('✅ M17种子数据已插入到正确位置');
