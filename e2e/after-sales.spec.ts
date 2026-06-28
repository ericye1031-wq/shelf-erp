import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('售后服务模块', () => {
  test('服务工单页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m16/service-tickets`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('维修记录页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m16/repairs`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('质保管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m16/warranties`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
