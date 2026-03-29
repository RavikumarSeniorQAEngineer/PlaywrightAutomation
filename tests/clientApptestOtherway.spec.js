const {test, expect} = require('@playwright/test');

test('Ekart Client App other way login and Playwright end-end test', async ({page})=> 
{
    const email = "ravikumarifocus1@gmail.com";
    const productName = "ZARA COAT 3";
    const products = page.locator(".card-body");
    await page.goto("https://rahulshettyacademy.com/client");
    console.log(await page.title());
    await expect(page).toHaveTitle("Let's Shop");
    await page.getByPlaceholder("email@example.com").fill(email);
    await page.getByPlaceholder("enter your passsword").fill("Ravi123@");
    await page.getByRole('button', {name: "Login"}).click();

    // wait till all network call is complete
    await page.waitForLoadState('networkidle');
    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 

    await products.filter({hasText: productName}).getByRole("button", {name: 'Add To Cart'}).click();

    await page.getByRole("listitem").getByRole("button", {name: 'Cart'}).click();

    await page.locator("div li").first().waitFor();
    await expect(page.getByText(productName)).toBeVisible();
    await page.getByRole("button", {name: "Checkout"}).click();

    await page.getByPlaceholder("Select Country").pressSequentially("ind", {delay: 150});   
    await page.getByRole("button", {name: "India"}).nth(1).click();
    await page.getByRole('textbox').nth(3).fill("rahulshettyacademy");
    await page.getByRole('button', { name: 'Apply Coupon' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('textbox').nth(4)).toHaveValue(email);
    await page.getByText(/PLACE ORDER/i).click();
    
    await expect(page.getByText("Thankyou for the order.")).toBeVisible();
    const rawOrderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
    const orderId = rawOrderId.replace(/\|/g,"").trim();
    console.log(orderId);
    await page.locator('button').filter({ hasText: 'ORDERS' }).click();

    await page.locator("tbody").waitFor(); // wait for table to be visible
    await page.getByRole("row", {name: orderId}).locator("button").first().click();
    
    //await page.locator("tr").filter({hasText: orderId}).locator("button").first().click();
    const orderIdInDetails = await page.locator(".col-text").textContent();
    expect(orderId.includes(orderIdInDetails)).toBeTruthy();
});

