const {test, expect} = require('@playwright/test');

//test.describe.configure({mode: "parallel"});
test.describe.configure({mode: "serial"});
test('popup handling', async({page}) =>
{
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");

    // page operation
    await page.goto("https://google.com");
    await page.goBack();
    await page.goForward();
    await page.reload();
    await page.goBack();

    //element hide and show 
    await expect(page.locator("#displayed-text")).toBeVisible();
    await page.locator("#hide-textbox").click();
    await expect(page.locator("#displayed-text")).toBeHidden();

    // java popup accept or dismiss
    page.on("dialog", dialog => dialog.accept());
    await page.locator("#confirmbtn").click();
    //page.on("dialog", dialog => dialog.dismiss());
    
    //mouse hover
    await page.locator("#mousehover").hover();
    await page.locator(".mouse-hover-content").getByText("Top").click();

    // frames inside a page (another page inside a page)
    const framesPage = page.frameLocator("#courses-iframe"); 
    await framesPage.locator("li a[href*='lifetime-access']:visible").click();
    const subscriberText = await framesPage.locator(".text h2").textContent();
    console.log(subscriberText.split(" ")[1]);
});

test("Screenshot test and Visual Comparsion", async({page})=>
{
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator("#displayed-text")).toBeVisible();
    await page.locator("#displayed-text").screenshot({path: "partialScreenshot.png"});
    await page.locator("#hide-textbox").click();
    await page.screenshot({path: "screenshot.png"});
    await expect(page.locator("#displayed-text")).toBeHidden();
});

test('visual validation with comparison', async ({page}) => {
    await page.goto("https://rahulshettyacademy.com/angularpractice/");
    expect(await page.screenshot()).toMatchSnapshot('landing.png');
});
