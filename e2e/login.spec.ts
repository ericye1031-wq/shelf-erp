import { test, expect } from '@playwright/test';
import { setupApiMock } from './helpers/mock-api';

test.describe('用户登录流程', () => {
  test('应该成功登录系统', async ({ page }) => {
    await setupApiMock(page);

    // 1. 访问登录页
    await page.goto('/');

    // 2. 验证登录表单存在
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // 3. 填写登录信息
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin123');

    // 4. 提交登录表单
    await page.locator('button[type="submit"]').click();

    // 5. 验证登录成功（跳转到仪表盘）
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.locator('text=仪表盘').or(page.locator('text=Dashboard'))).toBeVisible({ timeout: 10000 });
  });

  test('应该拒绝错误密码', async ({ page }) => {
    await setupApiMock(page);

    await page.goto('/');

    // 填写错误的登录信息
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // 验证显示错误消息
    await expect(page.locator('text=用户名或密码错误')).toBeVisible({ timeout: 10000 });

    // 验证仍在登录页
    await expect(page).toHaveURL(/.*login.*/);
  });
});
