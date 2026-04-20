const {test, expect} = require('@playwright/test');
const {POManager} =  require('../pageObjects/POManager');

test('Ekart Client App login and Playwright end-end test', async ({page})=> 
{
    const poManager = new POManager(page);
    const email = "learningplaywrighttoday@learning.com";
    const password = "Lear@123";
    const productName = "ZARA COAT 3";
    const couponCode = "rahulshettyacademy";
    const loginpage = poManager.getLoginPage();
    await loginpage.clientLoginPage();
    await loginpage.validLogin(email,password);
    // or you can wait till element visible
    await page.locator(".card-body b").last().waitFor(); 
    
    const dashboardPage = poManager.getDashboardPage();
    await dashboardPage.searchProductsAddCart(productName);
    await dashboardPage.navigateToCart();
    
    const cartPage = poManager.getCartPage();
    cartPage.verifyProductIsDisplayed(productName);
    cartPage.goToCheckout();

    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind"," India");
    await ordersReviewPage.applyCouponCode(couponCode);
    await ordersReviewPage.verifyEmailId(email);
    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderId);

    await dashboardPage.navigateToOrders();

    const ordersHistoryPage = poManager.getOrdersHistoryPage();
    ordersHistoryPage.searchOrderAndSelect(orderId);
    expect(orderId.includes(await ordersHistoryPage.getOrderId())).toBeTruthy();

    // await page.pause();
});

