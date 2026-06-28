/**
 * 运行时数据验证测试
 * 验证所有 mock 数据的完整性和正确性
 * 运行: npx vite-node tests/runtime-validation.test.ts
 */

import { m02MockCustomers, m02MockContacts, m02MockOpportunities, m02MockInquiries } from '@/mock/m02';
import { m04MockShelfTypes, m04MockConfigs, m04MockSpecs } from '@/mock/m04';
import { m05MockQuotations, m05MockCurrencies } from '@/mock/m05';
import { m06MockContracts } from '@/mock/m06';
import { m07MockProjects, m07MockAlerts } from '@/mock/m07';
import { m10MockWorkOrders, m10MockEquipment } from '@/mock/m10';

interface ValidationResult {
  module: string;
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}

const results: ValidationResult[] = [];

function validateFields(obj: Record<string, unknown>, requiredFields: string[], objName: string, index: number): string[] {
  const errors: string[] = [];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      errors.push(`${objName}[${index}]: 缺少必需字段 '${field}'`);
    }
  }
  return errors;
}

function validateM02(): ValidationResult {
  const errors: string[] = [];

  const customerFields = ['id', 'name', 'code', 'status'];
  m02MockCustomers.forEach((c, i) => {
    errors.push(...validateFields(c as Record<string, unknown>, customerFields, 'Customer', i));
  });

  const contactFields = ['id', 'customerId', 'name', 'isPrimary'];
  m02MockContacts.forEach((c, i) => {
    errors.push(...validateFields(c as Record<string, unknown>, contactFields, 'Contact', i));
  });

  const oppFields = ['id', 'customerId', 'title', 'stage', 'status'];
  m02MockOpportunities.forEach((o, i) => {
    errors.push(...validateFields(o as Record<string, unknown>, oppFields, 'Opportunity', i));
  });

  const inquiryFields = ['id', 'code', 'customerId', 'quantity', 'status'];
  m02MockInquiries.forEach((iq, i) => {
    errors.push(...validateFields(iq as Record<string, unknown>, inquiryFields, 'Inquiry', i));
  });

  return {
    module: 'M02 客户询价',
    total: m02MockCustomers.length + m02MockContacts.length + m02MockOpportunities.length + m02MockInquiries.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function validateM04(): ValidationResult {
  const errors: string[] = [];

  const shelfTypeFields = ['id', 'name', 'code', 'category', 'status'];
  m04MockShelfTypes.forEach((s, i) => {
    errors.push(...validateFields(s as Record<string, unknown>, shelfTypeFields, 'ShelfType', i));
  });

  const configFields = ['id', 'shelfTypeId', 'name', 'parameters', 'status'];
  m04MockConfigs.forEach((c, i) => {
    errors.push(...validateFields(c as Record<string, unknown>, configFields, 'ShelfConfig', i));
  });

  const specFields = ['id', 'name', 'shelfTypeId'];
  m04MockSpecs.forEach((s, i) => {
    errors.push(...validateFields(s as Record<string, unknown>, specFields, 'Specification', i));
  });

  return {
    module: 'M04 产品管理',
    total: m04MockShelfTypes.length + m04MockConfigs.length + m04MockSpecs.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function validateM05(): ValidationResult {
  const errors: string[] = [];

  const quotationFields = ['id', 'code', 'customerId', 'quantity', 'status'];
  m05MockQuotations.forEach((q, i) => {
    errors.push(...validateFields(q as Record<string, unknown>, quotationFields, 'Quotation', i));
  });

  const currencyFields = ['id', 'code', 'name', 'symbol', 'rate'];
  m05MockCurrencies.forEach((c, i) => {
    errors.push(...validateFields(c as Record<string, unknown>, currencyFields, 'Currency', i));
  });

  return {
    module: 'M05 报价管理',
    total: m05MockQuotations.length + m05MockCurrencies.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function validateM06(): ValidationResult {
  const errors: string[] = [];

  const contractFields = ['id', 'code', 'customerId', 'amount', 'status'];
  m06MockContracts.forEach((c, i) => {
    errors.push(...validateFields(c as Record<string, unknown>, contractFields, 'Contract', i));
  });

  return {
    module: 'M06 合同管理',
    total: m06MockContracts.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function validateM07(): ValidationResult {
  const errors: string[] = [];

  const projectFields = ['id', 'code', 'name', 'customerId', 'status'];
  m07MockProjects.forEach((p, i) => {
    errors.push(...validateFields(p as Record<string, unknown>, projectFields, 'Project', i));
  });

  const alertFields = ['id', 'projectId', 'type', 'level'];
  m07MockAlerts.forEach((a, i) => {
    errors.push(...validateFields(a as Record<string, unknown>, alertFields, 'Alert', i));
  });

  return {
    module: 'M07 项目管理',
    total: m07MockProjects.length + m07MockAlerts.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function validateM10(): ValidationResult {
  const errors: string[] = [];

  const workOrderFields = ['id', 'code', 'projectId', 'quantity', 'status'];
  m10MockWorkOrders.forEach((w, i) => {
    errors.push(...validateFields(w as Record<string, unknown>, workOrderFields, 'WorkOrder', i));
  });

  const equipmentFields = ['id', 'name', 'code', 'status'];
  m10MockEquipment.forEach((e, i) => {
    errors.push(...validateFields(e as Record<string, unknown>, equipmentFields, 'Equipment', i));
  });

  return {
    module: 'M10 生产管理',
    total: m10MockWorkOrders.length + m10MockEquipment.length,
    passed: 0,
    failed: errors.length,
    errors,
  };
}

function runValidation() {
  console.log('🚀 开始运行时数据验证...\n');

  results.push(validateM02());
  results.push(validateM04());
  results.push(validateM05());
  results.push(validateM06());
  results.push(validateM07());
  results.push(validateM10());

  console.log('\n📊 验证结果汇总:');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    const status = result.failed === 0 ? '✅' : '❌';
    console.log(`${status} ${result.module}: ${result.total} 条数据, ${result.failed} 个错误`);

    if (result.errors.length > 0) {
      console.log('  错误详情:');
      result.errors.forEach(err => console.log(`    - ${err}`));
    }

    totalPassed += result.total - result.failed;
    totalFailed += result.failed;
  }

  console.log('='.repeat(60));
  console.log(`\n📈 总计: ${totalPassed + totalFailed} 条数据, ✅ ${totalPassed} 通过, ❌ ${totalFailed} 失败`);

  if (totalFailed > 0) {
    console.log('\n⚠️ 发现数据完整性问题，建议修复上述错误。');
    process.exit(1);
  } else {
    console.log('\n🎉 所有数据验证通过！');
    process.exit(0);
  }
}

runValidation();
