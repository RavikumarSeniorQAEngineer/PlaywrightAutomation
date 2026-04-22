const {test, expect, request} = require("@playwright/test");
const {APIUtils} = require("../utils/APIUtils");

let response;
const loginPayload = {userEmail:"ravikumarifocus1@gmail.com",userPassword:"Ravi123@"};
const orderPayload = {orders:[{country:"Cuba",productOrderedId:"6960eac0c941646b7a8b3e68"}]};
const emptyOrderPayload = {data:[], message: "No Orders"};

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

    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
        async route=>
        {
            // intercepting response - API response -> {playwright fakeresponse} -> browser -> render data on front end
            const response = await page.request.fetch(route.request());
            let body = JSON.stringify(emptyOrderPayload);
            route.fulfill(
                {
                    response,
                    body,
                });
        });



    await page.locator("button[routerlink*='myorders']").click();

    // wait till the actual response render and then inject the mock data 
    await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*");

    console.log(await page.locator(".mt-4").textContent());

    
});
