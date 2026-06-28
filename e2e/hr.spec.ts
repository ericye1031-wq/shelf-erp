import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('HR人力模块', () => {
  test('员工管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m14/employees`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('考勤管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m14/attendance`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('薪酬管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m14/salary`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
