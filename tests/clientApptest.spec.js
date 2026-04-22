const {test, expect} = require('@playwright/test');

// test.skip beacuse same implementation with PO is runing in different file
test.skip('Ekart Ecommerce Playwright test', async ({page})=> 
{
    await page.goto("https://rahulshettyacademy.com/client");
    console.log(await page.title());
    await expect(page).toHaveTitle("Let's Shop");
    await page.locator("#userEmail").fill("ravikumarifocus1@gmail.com");
    await page.locator("#userPassword").fill("Ravi123@");
    await page.locator("[value='Login']").click();

    // wait till all network call is complete
    await page.waitForLoadState('networkidle');

    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 

    const titles = await page.locator(".card-body b").allTextContents();
    console.log(titles);

    //console.log(await page.locator(".card-body b").first().textContent());

});

// test.skip beacuse same implementation with PO is runing in different file
test.skip('Ekart Client App login and Playwright end-end test', async ({page})=> 
{
    const email = "ravikumarifocus1@gmail.com";
    const productName = "ZARA COAT 3";
    const products = page.locator(".card-body");
    await page.goto("https://rahulshettyacademy.com/client");
    console.log(await page.title());
    await expect(page).toHaveTitle("Let's Shop");
    await page.locator("#userEmail").fill(email);
    await page.locator("#userPassword").fill("Ravi123@");
    await page.locator("[value='Login']").click();

    // wait till all network call is complete
    await page.waitForLoadState('networkidle');

    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 

    const titles = await page.locator(".card-body b").allTextContents();
    console.log(titles);

    //console.log(await page.locator(".card-body b").first().textContent());

    const count = await products.count();
    for(let i=0; i<count; ++i){
        if(await products.nth(i).locator("b").textContent() === productName)
        {
            await products.nth(i).locator("text= Add To Cart").click();
            break;
        }
    }
    await page.locator("[routerlink*='cart']").click();

    await page.locator("div li").first().waitFor();
    const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    expect(bool).toBeTruthy();
    await page.locator("button:has-text('Checkout')").click();
    // await page.locator("text=Checkout").click(); // we can write text or tag:has-text

    await page.locator("[placeholder*='Country']").pressSequentially("ind", {delay: 150});
    const dropdown = page.locator(".ta-results");
    await dropdown.waitFor();
    const dropdownOptionsCount = await dropdown.locator("button").count();

    for(let i =0; i<dropdownOptionsCount; ++i)
    {
        const button = dropdown.locator("button").nth(i)
        const text = await button.textContent();
        if (text === " India")
        {
            await button.click();
            break;
        }
    }

    await page.locator(".input.txt").nth(3).fill("rahulshettyacademy");
    await page.locator(".btn.btn-primary.mt-1").click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".user__name [type='text']").first()).toHaveText(email);
    await page.locator(".action__submit").click();
    
    await expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. ");
    const orderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
    console.log(orderId);

    await page.locator("button[routerlink*='myorders']").click();

    await page.locator("tbody").waitFor();
    const rows = page.locator("tbody tr"); // no need of await because no action
    const rowsCount = await rows.count();

    for(let i=0; i < rowsCount; ++i)
    {
        const row = rows.nth(i);
        const rowOrderId = await row.locator("th").textContent();
        if(orderId.includes(rowOrderId))
        {
            await row.locator("button").first().click();
            break;
        }
    }

    const orderIdInDetails = await page.locator(".col-text").textContent();
    expect(orderId.includes(orderIdInDetails)).toBeTruthy();

    // await page.pause();
});

