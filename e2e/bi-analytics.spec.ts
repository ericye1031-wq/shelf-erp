import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('BI商业智能模块', () => {
  test('数据看板页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m17/dashboards`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], canvas, svg, .recharts-wrapper, [class*="chart"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CEO驾驶舱页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m17/ceo-dashboard`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], canvas, svg, .recharts-wrapper, [class*="chart"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('生产看板页面应该正常加载', async ({ page }) => {
    await setupTestEnv(page);
    await page.goto(`${BASE}/m17/production-dashboard`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('nav, .MuiDrawer-paper, [class*="sidebar"], [class*="Sidebar"], canvas, svg, .recharts-wrapper, [class*="chart"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
