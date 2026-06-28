import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('MES生产模块', () => {
  test('工单管理页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m10/work-orders`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('工艺路线页面应该正常加载并显示标题', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m10/process-routes`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=工艺路线')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('OEE设备综合效率页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m10/oee`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], canvas, svg, .recharts-wrapper, [class*="chart"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('生产排程页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m10/schedule`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], table, .MuiTable-root, [class*="table"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
