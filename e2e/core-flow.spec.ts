import { test, expect } from '@playwright/test';
import { setupApiMock, setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('核心流程', () => {
  test('登录流程：admin/admin123 应成功跳转到仪表盘', async ({ page }) => {
    await setupApiMock(page);

    // 访问登录页
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    // 填写凭据
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin123');

    // 提交
    await page.locator('button[type="submit"]').click();

    // 验证跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(
      page.locator('text=仪表盘').or(page.locator('text=Dashboard'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('导航菜单应包含所有预期模块条目', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 等待侧边栏渲染
    await page.waitForTimeout(2000);

    const sidebar = page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"]').first();

    const expectedItems = [
      '系统管理',
      '销售CRM',
      '货架配置器',
      '报价引擎',
      '合同管理',
      '项目管理',
      'BOM管理',
      'MES生产',
      '仓储管理',
      '成本核算',
      '财务总账',
      'HR人力',
      '售后服务',
      'BI商业智能',
    ];

    for (const item of expectedItems) {
      await expect(sidebar.locator(`text=${item}`).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
