// @ts-check
import { chromium, defineConfig, devices } from '@playwright/test';
import { trace } from 'node:console';


/**
 * @see https://playwright.dev/docs/test-configuration
 */

// export default defineConfig({ we can also write as below

const config = ({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  reporter: 'html',
  use: {
    browserName: 'chromium',
    headless: false
  }

});

module.exports = config;