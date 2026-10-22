const { test, expect } = require('@playwright/test');

test('Dashboard renders correctly in Dark and Light mode', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBe('dark');

  await page.screenshot({ path: 'tests/dashboard-dark.png', fullPage: true });

  await page.click('#themeToggle');

  const lightTheme = await page.getAttribute('html', 'data-theme');
  expect(lightTheme).toBe('light');

  await page.screenshot({ path: 'tests/dashboard-light.png', fullPage: true });
});
