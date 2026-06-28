import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('财务总账模块', () => {
  test('固定资产管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m13/fixed-assets`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=固定资产管理')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('费用管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m13/expenses`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    // 验证页面导航或内容存在
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('发票管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m13/invoices`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
