import { DataSource } from 'typeorm';
import { Account } from '../../m13/accounts/account.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * M13 会计科目种子数据
 * 按照货架企业实际业务需求，插入标准会计科目模板
 * 包含5大类共22个科目，覆盖现金、银行、应收、应付、生产成本、收入等核心科目
 */
export async function runM13AccountSeed(dataSource: DataSource, adminId?: string): Promise<void> {
  const accountRepo = dataSource.getRepository(Account);

  if (await accountRepo.count() > 0) {
    console.log('  ⏭ 会计科目已存在，跳过');
    return;
  }

  const SYSTEM_USER_ID = adminId || '00000000-0000-0000-0000-000000000001';

  // ─── 资产类科目 ───
  const accounts: {
    code: string;
    name: string;
    parentCode: string | null;
    category: '资产' | '负债' | '权益' | '成本' | '损益';
    balanceDirection: 'debit' | 'credit';
    isLeaf: boolean;
  }[] = [
    // ─── 资产类 ───
    { code: '1001', name: '库存现金', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1002', name: '银行存款', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1012', name: '其他货币资金', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1122', name: '应收账款', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1123', name: '预付账款', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1403', name: '原材料', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1405', name: '库存商品', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1411', name: '周转材料', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1601', name: '固定资产', parentCode: null, category: '资产', balanceDirection: 'debit', isLeaf: true },
    { code: '1602', name: '累计折旧', parentCode: null, category: '资产', balanceDirection: 'credit', isLeaf: true },

    // ─── 负债类 ───
    { code: '2001', name: '短期借款', parentCode: null, category: '负债', balanceDirection: 'credit', isLeaf: true },
    { code: '2202', name: '应付账款', parentCode: null, category: '负债', balanceDirection: 'credit', isLeaf: true },
    { code: '2203', name: '预收账款', parentCode: null, category: '负债', balanceDirection: 'credit', isLeaf: true },
    { code: '2211', name: '应付职工薪酬', parentCode: null, category: '负债', balanceDirection: 'credit', isLeaf: true },
    { code: '2221', name: '应交税费', parentCode: null, category: '负债', balanceDirection: 'credit', isLeaf: true },

    // ─── 权益类 ───
    { code: '3001', name: '实收资本', parentCode: null, category: '权益', balanceDirection: 'credit', isLeaf: true },
    { code: '3002', name: '资本公积', parentCode: null, category: '权益', balanceDirection: 'credit', isLeaf: true },
    { code: '3101', name: '盈余公积', parentCode: null, category: '权益', balanceDirection: 'credit', isLeaf: true },
    { code: '3103', name: '本年利润', parentCode: null, category: '权益', balanceDirection: 'credit', isLeaf: true },

    // ─── 成本类 ───
    { code: '5001', name: '生产成本', parentCode: null, category: '成本', balanceDirection: 'debit', isLeaf: true },
    { code: '5101', name: '制造费用', parentCode: null, category: '成本', balanceDirection: 'debit', isLeaf: true },

    // ─── 损益类 ───
    { code: '6001', name: '主营业务收入', parentCode: null, category: '损益', balanceDirection: 'credit', isLeaf: true },
    { code: '6051', name: '其他业务收入', parentCode: null, category: '损益', balanceDirection: 'credit', isLeaf: true },
    { code: '6401', name: '主营业务成本', parentCode: null, category: '损益', balanceDirection: 'debit', isLeaf: true },
    { code: '6402', name: '其他业务成本', parentCode: null, category: '损益', balanceDirection: 'debit', isLeaf: true },
    { code: '6601', name: '管理费用', parentCode: null, category: '损益', balanceDirection: 'debit', isLeaf: true },
    { code: '6602', name: '销售费用', parentCode: null, category: '损益', balanceDirection: 'debit', isLeaf: true },
    { code: '6603', name: '财务费用', parentCode: null, category: '损益', balanceDirection: 'debit', isLeaf: true },
  ];

  const savedAccounts: Account[] = [];
  for (const a of accounts) {
    const entity = accountRepo.create({
      ...a,
      parentId: null,
      auxTypes: null,
      hasAux: false,
      status: 'active',
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    savedAccounts.push(await accountRepo.save(entity));
  }

  console.log(`  ✅ 创建 ${savedAccounts.length} 个会计科目`);
}
