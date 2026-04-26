const {test, expect} = require('@playwright/test');

test('@Web Go kart Playwright test', async ({page})=> 
{
    await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/");
    console.log(await page.title());
    await expect(page).toHaveTitle('GreenKart - veg and fruits kart');
    await page.locator('button').filter({ hasText: 'ADD TO CART' }).first().click();
    await page.locator('.cart-icon').click();
    await page.locator('a.product-remove').first().click();

});