const { Given, When, Then } = require('@cucumber/cucumber');
const { POManager } = require('../../pageObjects/POManager');
const { expect } = require('@playwright/test');
const playwright = require('@playwright/test');

Given('A Login to ecommerce application with {string} and {string}', { timeout: 100 * 1000 }, async function (username, password) {
   // Write code here that turns the phrase above into concrete actions
   const loginpage = this.poManager.getLoginPage();
   await loginpage.clientLoginPage();
   await loginpage.validLogin(username, password);
   // or you can wait till element visible
   await this.page.locator(".card-body b").last().waitFor();
});

When('Add {string} to cart', async function (productName) {
   // Write code here that turns the phrase above into concrete actions
   this.dashboardPage = this.poManager.getDashboardPage();
   await this.dashboardPage.searchProductsAddCart(productName);
   await this.dashboardPage.navigateToCart();
});

Then('Verify that {string} is displayed in cart', async function (productName) {
   // Write code here that turns the phrase above into concrete actions
   const cartPage = this.poManager.getCartPage();
   await cartPage.verifyProductIsDisplayed(productName);
   await cartPage.goToCheckout();
});

When('Enter valid details and place the order with coupon {string} and email {string}', async function (couponCode, emailId) {
   // Write code here that turns the phrase above into concrete actions
   const ordersReviewPage = this.poManager.getOrdersReviewPage();
   await ordersReviewPage.searchCountryAndSelect("ind", " India");
   await ordersReviewPage.applyCouponCode(couponCode);
   await ordersReviewPage.verifyEmailId(emailId);
   this.orderId = await ordersReviewPage.SubmitAndGetOrderId();
   console.log(this.orderId);
});

Then('Verify that order is present in the orderhistory', async function () {
   // Write code here that turns the phrase above into concrete actions
   await this.dashboardPage.navigateToOrders();
   const ordersHistoryPage = this.poManager.getOrdersHistoryPage();
   await ordersHistoryPage.searchOrderAndSelect(this.orderId);
   expect(this.orderId.includes(await ordersHistoryPage.getOrderId())).toBeTruthy();
});

Given('A Login to ecommerce2 application with {string} and {string}', async function (username, password) {
   // Write code here that turns the phrase above into concrete actions
   const userName = this.page.locator("#username");
   const signIn = this.page.locator('#signInBtn');
   await this.page.goto("https://rahulshettyacademy.com/loginpagePractise/");
   console.log(await this.page.title());
   await userName.fill(username);
   await this.page.locator("[type='password']").fill(password);
   await signIn.click();
});

Then('Verify that error message is displayed', async function () {
   // Write code here that turns the phrase above into concrete actions
   console.log(await this.page.locator('[style*="block"]').textContent());
   await expect(this.page.locator('[style*="block"]')).toContainText('Incorrect');
});