const { test, expect } = require("@playwright/test");

test('@QW Security test request intercept', async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill("learningplaywright@learning.com");
    await page.locator("#userPassword").fill("Lear@123");
    await page.locator("[value='Login']").click();

    // wait till all network call is complete
    await page.waitForLoadState('networkidle');

    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor();

    await page.locator("button[routerlink*='myorders']").click();

    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
        route => route.continue({ url: 'https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=64ceb0487244490f9597ef94' }))
    await page.locator("button:has-text('View')").first().click();
    await expect(page.locator("p").last()).toHaveText("You are not authorize to view this order");
});

test('@QWB CSS Blocking Playwright test', async ({browser})=>
{
    const context = await browser.newContext();
    const page = await context.newPage();
    page.route("**/*.css", route => route.abort());
    page.route("**/*.{jpg,jpeg,png}", route => route.abort());
    page.on('request', request => console.log(request.url()));
    page.on('response', response => console.log(response.url(), response.status()));
    const userName = page.locator("#username");
    const signIn = page.locator('#signInBtn');
    const cardTitles = page.locator(".card-body a");
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    console.log(await page.title());
    await userName.fill("rahulshetty");
    await page.locator("[type='password']").fill("Learning@830$3mK2");
    await signIn.click();
    console.log(await page.locator('[style*="block"]').textContent());
    await expect (page.locator('[style*="block"]')).toContainText('Incorrect');

    await userName.fill("");
    await userName.fill("rahulshettyacademy");
    await signIn.click();
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());
    const titles = await cardTitles.allTextContents();
    console.log(titles);
});