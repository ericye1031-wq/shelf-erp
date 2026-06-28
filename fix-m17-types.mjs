import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2] || 'src/database/seeds/business-seed.ts';
let content = readFileSync(filePath, 'utf8');

// 修复1: 将M17部分的 reportRepo 重命名为 m17ReportRepo
// 先找到M17部分的起始位置
const m17Start = content.indexOf('// ─── M17 BI商业智能 ───');
if (m17Start !== -1) {
  // 找到M17部分中 reportRepo 的位置（在 // 报表 之后）
  const reportSection = content.indexOf('// 报表\n  const reportRepo', m17Start);
  if (reportSection !== -1) {
    // 替换 reportRepo 为 m17ReportRepo（仅限M17部分）
    const before = content.slice(0, reportSection);
    let m17Section = content.slice(reportSection);
    // 只替换M17部分中的 reportRepo（第一个出现的位置，即声明处）
    m17Section = m17Section.replace('const reportRepo =', 'const m17ReportRepo =');
    m17Section = m17Section.replace(/reportRepo\.(save|create|find)/g, 'm17ReportRepo.$1');
    content = before + m17Section;
  }
  
  // 修复2: 将枚举字符串值改为使用 as any 避免类型错误
  // 在M17部分中，将 type: 'sales' 改为 type: 'sales' as any
  const m17End = content.indexOf("console.log('✅ 核心业务种子数据运行完成');", m17Start);
  if (m17End !== -1) {
    const before = content.slice(0, m17Start);
    let m17Content = content.slice(m17Start, m17End);
    
    // 添加类型断言修复枚举类型错误
    m17Content = m17Content.replace(/type: '(sales|purchase|inventory|finance|project|custom)'/g, "type: '$1' as any");
    m17Content = m17Content.replace(/format: '(table|chart|pivot|summary)'/g, "format: '$1' as any");
    m17Content = m17Content.replace(/unit: '(count|amount|percentage|days|ratio)'/g, "unit: '$1' as any");
    m17Content = m17Content.replace(/trend: '(up|down|flat)'/g, "trend: '$1' as any");
    m17Content = m17Content.replace(/type: '(sqlite|mysql|postgresql|sqlserver|oracle|api|excel|csv)'/g, "type: '$1' as any");
    
    content = before + m17Content + content.slice(m17End);
  }
}

writeFileSync(filePath, content, 'utf8');
console.log('✅ 已修复M17种子数据中的变量名冲突和类型错误');
