const {test, expect, request} = require("@playwright/test");
const {APIUtils} = require("./utils/APIUtils");

let response;
const loginPayload = {userEmail:"ravikumarifocus1@gmail.com",userPassword:"Ravi123@"};
const orderPayload = {orders:[{country:"Cuba",productOrderedId:"6960eac0c941646b7a8b3e68"}]};

test.beforeAll( async ()=>
{
    const apiContext = await request.newContext();
    const APIutils = new APIUtils(apiContext, loginPayload);
    response = await APIutils.createOrder(orderPayload); 
});



test('Ekart Client App: Place the order', async ({page})=> 
{
    await page.addInitScript(value => 
    {
        window.localStorage.setItem("token", value)
    }, response.token );

    await page.goto("https://rahulshettyacademy.com/client");

    await page.locator("button[routerlink*='myorders']").click();

    await page.locator("tbody").waitFor();
    const rows = page.locator("tbody tr"); // no need of await because no action
    const rowsCount = await rows.count();

    for(let i=0; i < rowsCount; ++i)
    {
        const row = rows.nth(i)
        const rowOrderId = await row.locator("th").textContent();
        if(response.orderId.includes(rowOrderId))
        {
            await row.locator("button").first().click();
            break;
        }
    }

    const orderIdInDetails = await page.locator(".col-text").textContent();
    expect(response.orderId.includes(orderIdInDetails)).toBeTruthy();

});
