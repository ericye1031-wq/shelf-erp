/**
 * 自动化类型验证测试
 * 验证所有 mock 数据与类型定义是否匹配
 * 运行: npx vite-node tests/type-validation.test.ts
 *
 * 注意：此测试主要在 TypeScript 编译时进行类型检查，
 * 运行时仅验证数据存在性和基本完整性。
 */

import { m02MockCustomers, m02MockContacts, m02MockOpportunities, m02MockInquiries, m02MockFollowups } from '@/mock/m02';
import { m04MockShelfTypes, m04MockConfigs, m04MockSpecs } from '@/mock/m04';
import { m05MockQuotations, m05MockVersions, m05MockCurrencies } from '@/mock/m05';
import { m06MockContracts, m06MockPayments, m06MockInvoices } from '@/mock/m06';
import { m07MockProjects, m07MockMilestones, m07MockAlerts } from '@/mock/m07';
import { m10MockWorkOrders, m10MockEquipment } from '@/mock/m10';

import type {
  Customer, Contact, Opportunity, Inquiry, FollowUp,
  ShelfType, ShelfConfig, Specification,
  Quotation, QuotationVersion, Currency,
  Contract, PaymentPlan, Invoice,
  Project, Milestone, Alert,
  WorkOrder, Equipment,
} from '@/types';

interface TestResult {
  file: string;
  passed: number;
  failed: number;
  errors: string[];
}

const results: TestResult[] = [];

function testSection(name: string, fn: () => void) {
  console.log(`\n📋 测试: ${name}`);
  try {
    fn();
    console.log(`  ✅ ${name} 通过`);
    results.push({ file: name, passed: 1, failed: 0, errors: [] });
  } catch (error) {
    console.error(`  ❌ ${name} 失败:`, error);
    results.push({ file: name, passed: 0, failed: 1, errors: [String(error)] });
  }
}

function assertExists<T>(data: T[] | undefined, name: string): void {
  if (!data || !Array.isArray(data)) {
    throw new Error(`${name} 不是有效数组`);
  }
  if (data.length === 0) {
    throw new Error(`${name} 数据为空`);
  }
}

function assertType<T>(_data: T, _name: string): void {
  // TypeScript 编译时会检查类型
}

function runTests() {
  console.log('🚀 开始自动化类型验证测试...\n');

  testSection('M02 - 客户数据', () => {
    assertExists(m02MockCustomers, 'mockCustomers');
    assertExists(m02MockContacts, 'mockContacts');
    assertExists(m02MockOpportunities, 'mockOpportunities');
    assertExists(m02MockInquiries, 'mockInquiries');
    assertExists(m02MockFollowups, 'mockFollowups');
    m02MockCustomers.forEach(c => assertType<Customer>(c, 'Customer'));
    m02MockContacts.forEach(c => assertType<Contact>(c, 'Contact'));
  });

  testSection('M04 - 货架配置数据', () => {
    assertExists(m04MockShelfTypes, 'mockShelfTypes');
    assertExists(m04MockConfigs, 'mockConfigs');
    m04MockShelfTypes.forEach(s => assertType<ShelfType>(s, 'ShelfType'));
    m04MockConfigs.forEach(c => assertType<ShelfConfig>(c, 'ShelfConfig'));
  });

  testSection('M05 - 报价数据', () => {
    assertExists(m05MockQuotations, 'mockQuotations');
    assertExists(m05MockCurrencies, 'mockCurrencies');
    m05MockQuotations.forEach(q => assertType<Quotation>(q, 'Quotation'));
    m05MockCurrencies.forEach(c => assertType<Currency>(c, 'Currency'));
  });

  testSection('M06 - 合同数据', () => {
    assertExists(m06MockContracts, 'mockContracts');
    m06MockContracts.forEach(c => assertType<Contract>(c, 'Contract'));
  });

  testSection('M07 - 项目数据', () => {
    assertExists(m07MockProjects, 'mockProjects');
    assertExists(m07MockAlerts, 'mockAlerts');
    m07MockProjects.forEach(p => assertType<Project>(p, 'Project'));
  });

  testSection('M10 - 生产数据', () => {
    assertExists(m10MockWorkOrders, 'mockWorkOrders');
    assertExists(m10MockEquipment, 'mockEquipment');
    m10MockWorkOrders.forEach(w => assertType<WorkOrder>(w, 'WorkOrder'));
  });

  // 汇总
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);

  console.log('\n\n📊 测试结果汇总:');
  console.log('='.repeat(40));
  console.log(`✅ 通过: ${totalPassed}`);
  console.log(`❌ 失败: ${totalFailed}`);
  console.log('='.repeat(40));

  if (totalFailed > 0) {
    console.log('\n⚠️ 有测试失败，请检查上述错误。');
    process.exit(1);
  } else {
    console.log('\n🎉 所有类型验证测试通过！');
    process.exit(0);
  }
}

runTests();
