const {test, expect} = require('@playwright/test');
const {POManager} =  require('../pageObjects/POManager');
const {customtest} = require("../utils/test-base");
//json => string => js object
const dataset = JSON.parse(JSON.stringify(require('../utils/PlaceOrderTestdata.json')));

for (const data of dataset){
test(`@Web Ekart Client App login and Playwright end-end test ${data.productName}`, async ({page})=> 
{
    const poManager = new POManager(page);
    const loginpage = poManager.getLoginPage();
    await loginpage.clientLoginPage();
    await loginpage.validLogin(data.userName,data.password);
    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 
    
    const dashboardPage = poManager.getDashboardPage();
    await dashboardPage.searchProductsAddCart(data.productName);
    await dashboardPage.navigateToCart();
    
    const cartPage = poManager.getCartPage();
    await cartPage.verifyProductIsDisplayed(data.productName);
    await cartPage.goToCheckout();

    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind"," India");
    await ordersReviewPage.applyCouponCode(data.couponCode);
    await ordersReviewPage.verifyEmailId(data.userName);
    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderId);

    await dashboardPage.navigateToOrders();

    const ordersHistoryPage = poManager.getOrdersHistoryPage();
    await ordersHistoryPage.searchOrderAndSelect(orderId);
    expect(orderId.includes(await ordersHistoryPage.getOrderId())).toBeTruthy();

    // await page.pause();
});
}

customtest("Ekart Client end-end test using custom fixture", async ({page, testDataForOrder})=> 
{
    const poManager = new POManager(page);
    const loginpage = poManager.getLoginPage();
    await loginpage.clientLoginPage();
    await loginpage.validLogin(testDataForOrder.userName,testDataForOrder.password);
    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 
    
    const dashboardPage = poManager.getDashboardPage();
    await dashboardPage.searchProductsAddCart(testDataForOrder.productName);
    await dashboardPage.navigateToCart();
    
    const cartPage = poManager.getCartPage();
    cartPage.verifyProductIsDisplayed(testDataForOrder.productName);
    cartPage.goToCheckout();

    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind"," India");
    await ordersReviewPage.applyCouponCode(testDataForOrder.couponCode);
    await ordersReviewPage.verifyEmailId(testDataForOrder.userName);
    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderId);

    await dashboardPage.navigateToOrders();

    const ordersHistoryPage = poManager.getOrdersHistoryPage();
    ordersHistoryPage.searchOrderAndSelect(orderId);
    expect(orderId.includes(await ordersHistoryPage.getOrderId())).toBeTruthy();

});