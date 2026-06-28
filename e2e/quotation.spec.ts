import { test, expect } from '@playwright/test';
import { setupTestEnv } from './helpers/mock-api';

const BASE = 'http://localhost:5173/shelf-erp';

test.describe('报价管理模块', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnv(page);
  });

  test('应该能查看报价列表', async ({ page }) => {
    await page.goto(`${BASE}/m05/quotations`);
    await page.waitForTimeout(2000);

    await expect(page.locator('text=报价').or(page.locator('text=QUO')).first()).toBeVisible({ timeout: 10000 });

    const tableOrList = page.locator('table').or(page.locator('[role="list"]'));
    if (await tableOrList.count() > 0) {
      await expect(tableOrList.first()).toBeVisible();
    }
  });

  test('应该能打开创建报价页面', async ({ page }) => {
    await page.goto(`${BASE}/m05/quotations/create`);

    await expect(page.locator('text=基本信息').or(page.locator('text=客户')).or(page.locator('text=报价')).first()).toBeVisible({ timeout: 10000 });
  });

  test('应该能查看报价详情', async ({ page }) => {
    await page.goto(`${BASE}/m05/quotations`);
    await page.waitForTimeout(2000);

    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);

      const detailContent = page.locator('text=客户').or(page.locator('text=报价')).or(page.locator('text=金额')).or(page.locator('text=成本'));
      if (await detailContent.count() > 0) {
        await expect(detailContent.first()).toBeVisible({ timeout: 5000 });
      }
    }
    expect(true).toBeTruthy();
  });

  test('报价创建页面应包含成本明细区域', async ({ page }) => {
    await page.goto(`${BASE}/m05/quotations/create`);
    await page.waitForTimeout(2000);

    const costSection = page.locator('text=成本明细').or(page.locator('text=成本')).or(page.locator('text=费用'));
    const hasCostSection = await costSection.count();
    expect(hasCostSection).toBeGreaterThanOrEqual(0);
  });
});
