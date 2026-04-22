// @ts-check
import { chromium, defineConfig, devices } from '@playwright/test';
import { trace } from 'node:console';
import { permission } from 'node:process';


/**
 * @see https://playwright.dev/docs/test-configuration
 */

// export default defineConfig({ we can also write as below

const config = ({
  testDir: './tests',
  retries: 1,
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  reporter: 'html',
  projects: [
    {
      name: 'safari',
      use: {
        browserName: 'webkit',
        headless: false,
        ...devices['iPhone 15 Pro Max landscape']
      }
    },
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        headless: false,
        video: 'retain-on-failure',
        screenshot: 'off',
        traces: 'off',
        ignoreHttpsErrors: true,
        permission: ['geolocation'],
        viewport: {width: 1080, height: 1080}
      }
    }
  ]


});

module.exports = config;