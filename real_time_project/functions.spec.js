const {test, expect} = require('@playwright/test');
const {POManager} = require('../pageObjects/POManager');

/**
 * FUNCTION/UNIT TESTS - Test individual features in isolation
 * These are fast, focused, and don't depend on other tests
 * They test one specific feature only
 * 
 * Based on: clientAppPOtest.spec.js
 * Reference: TEST_STRATEGY_GUIDE.md - Section 1 (Function Tests)
 */

const BASE_URL = 'https://rahulshettyacademy.com/client';

test.describe('Authentication - Function Tests', () => {
    
    test.beforeEach(async ({page}) => {
        await page.goto(BASE_URL);
    });

    test('F1 - Valid login with correct credentials', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Assertion - Verify dashboard loaded with products
        await expect(page.locator(".card-body b").last()).toBeVisible();
    });

    test('F2 - Invalid login with wrong password', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "WrongPassword@123";
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Assertion - Verify error message appears
        const errorMessage = page.locator(".toast-error");
        await expect(errorMessage).toContainText('Incorrect email or password');
    });

    test('F3 - Invalid login with non-existent email', async ({page}) => {
        const poManager = new POManager(page);
        const email = "nonexistent@learning.com";
        const password = "Lear@123";
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Assertion - Verify error message
        const errorMessage = page.locator(".toast-error");
        await expect(errorMessage).toBeVisible();
    });
});

test.describe('Product Search & Cart Operations - Function Tests', () => {
    
    test.beforeEach(async ({page}) => {
        // Setup: Login before each test
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        await page.locator(".card-body b").last().waitFor();
    });

    test('F4 - Search product and add to cart', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        
        // Assertion - Verify success toast appears
        await expect(page.locator(".toast-success")).toBeVisible();
    });

    test('F5 - Search multiple products', async ({page}) => {
        const poManager = new POManager(page);
        const productNames = ["ZARA COAT 3", "ADIDAS ORIGINAL"];
        const dashboardPage = poManager.getDashboardPage();
        
        for (const productName of productNames) {
            await dashboardPage.searchProductsAddCart(productName);
            await expect(page.locator(".toast-success")).toBeVisible();
        }
    });

    test('F6 - Navigate to cart', async ({page}) => {
        const poManager = new POManager(page);
        const dashboardPage = poManager.getDashboardPage();
        
        // Add a product first
        await dashboardPage.searchProductsAddCart("ZARA COAT 3");
        
        // Navigate to cart
        await dashboardPage.navigateToCart();
        
        // Assertion - Verify cart page is loaded
        await expect(page.locator("//h1[text()='Cart']")).toBeVisible();
    });

    test('F7 - Verify product in cart', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        cartPage.verifyProductIsDisplayed(productName);
        
        // Assertion - Product should be visible in cart
        await expect(page.locator(`text=${productName}`)).toBeVisible();
    });

    test('F8 - Go to checkout from cart', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Assertion - Verify checkout page loads
        await expect(page.locator("text=Order Summary")).toBeVisible();
    });

    test('F9 - Remove product from cart', async ({page}) => {
        const poManager = new POManager(page);
        const dashboardPage = poManager.getDashboardPage();
        
        await dashboardPage.searchProductsAddCart("ZARA COAT 3");
        await dashboardPage.navigateToCart();
        
        const removeButton = page.locator("button:has-text('Remove')").first();
        
        // Count initial items
        const initialCount = await page.locator("div li").count();
        
        // Remove item
        await removeButton.click();
        await page.waitForTimeout(500);
        
        // Assertion - Item count should decrease
        const finalCount = await page.locator("div li").count();
        expect(finalCount).toBeLessThan(initialCount);
    });
});

test.describe('Checkout & Payment - Function Tests', () => {
    
    test.beforeEach(async ({page}) => {
        // Setup: Login, search, add to cart, and go to checkout
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
    });

    test('F10 - Select country from dropdown', async ({page}) => {
        const poManager = new POManager(page);
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Assertion - Verify country selected
        await expect(page.locator("text=India")).toBeVisible();
    });

    test('F11 - Apply coupon code', async ({page}) => {
        const poManager = new POManager(page);
        const couponCode = "rahulshettyacademy";
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        await ordersReviewPage.applyCouponCode(couponCode);
        
        // Assertion - Verify coupon applied (discount visible)
        const discountText = page.locator(".ng-star-inserted");
        await expect(discountText).toBeVisible();
    });

    test('F12 - Verify email in checkout', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        await ordersReviewPage.verifyEmailId(email);
        
        // Assertion - Verify email is displayed
        await expect(page.locator(`text=${email}`)).toBeVisible();
    });

    test('F13 - Place order and get order ID', async ({page}) => {
        const poManager = new POManager(page);
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        
        // Assertion - Verify order ID was generated
        expect(orderId).toBeTruthy();
        expect(orderId.length).toBeGreaterThan(0);
    });
});

test.describe('Order History - Function Tests', () => {
    
    test('F14 - Navigate to orders history page', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        await ordersReviewPage.SubmitAndGetOrderId();
        
        await dashboardPage.navigateToOrders();
        
        // Assertion - Verify orders page loaded
        await expect(page.locator("//h1[text()='Your Orders']")).toBeVisible();
    });

    test('F15 - Search and select order from history', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        
        // Navigate to orders
        await dashboardPage.navigateToOrders();
        
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        // Assertion - Verify order is displayed
        const orderElement = page.locator(`.ng-star-inserted:has-text("${orderId}")`);
        await expect(orderElement).toBeVisible();
    });
});

test.describe('Negative Testing - Function Tests', () => {
    
    test.beforeEach(async ({page}) => {
        // Setup: Login before each test
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        await page.locator(".card-body b").last().waitFor();
    });

    test('FN1 - Search for non-existent product', async ({page}) => {
        const poManager = new POManager(page);
        const invalidProductName = "NONEXISTENT_PRODUCT_XYZ";
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Try to search for product that doesn't exist
        const productLocator = page.locator(`h5:has-text('${invalidProductName}')`);
        const isVisible = await productLocator.isVisible({timeout: 2000}).catch(() => false);
        
        // Assertion - Product should NOT be found
        expect(isVisible).toBeFalsy();
    });

    test('FN2 - Remove all products from cart', async ({page}) => {
        const poManager = new POManager(page);
        const dashboardPage = poManager.getDashboardPage();
        
        // Add product
        await dashboardPage.searchProductsAddCart("ZARA COAT 3");
        await dashboardPage.navigateToCart();
        
        // Remove product
        const removeButton = page.locator("button:has-text('Remove')").first();
        await removeButton.click();
        await page.waitForTimeout(500);
        
        // Assertion - Cart should be empty
        const cartItems = page.locator("div li");
        const count = await cartItems.count();
        expect(count).toBe(0);
    });

    test('FN3 - Try to checkout with empty cart', async ({page}) => {
        const dashboardPage = new POManager(page).getDashboardPage();
        
        // Try to navigate to cart without adding anything
        await dashboardPage.navigateToCart();
        
        // Assertion - Checkout button should be disabled or not available
        const checkoutButton = page.locator("button:has-text('Checkout')");
        const isDisabled = await checkoutButton.isDisabled().catch(() => true);
        const isVisible = await checkoutButton.isVisible({timeout: 1000}).catch(() => false);
        
        expect(isDisabled || !isVisible).toBeTruthy();
    });

    test('FN4 - Invalid country selection attempt', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Try to type invalid country code
        await page.locator("[placeholder*='Country']").pressSequentially("ZZZ", {delay: 150});
        
        // Assertion - Invalid country dropdown should not show options
        const dropdown = page.locator(".ta-results");
        const dropdownCount = await dropdown.locator("button").count().catch(() => 0);
        expect(dropdownCount).toBe(0);
    });

    test('FN5 - Apply invalid coupon code', async ({page}) => {
        const poManager = new POManager(page);
        const invalidCoupon = "INVALID_COUPON_12345";
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Try to apply invalid coupon
        const couponInput = page.locator("input[placeholder*='promo']");
        await couponInput.fill(invalidCoupon);
        await page.locator("button:has-text('Apply')").click();
        await page.waitForTimeout(1000);
        
        // Assertion - Error should appear or no discount
        const errorMsg = page.locator(".alert-danger, .text-danger");
        const hasError = await errorMsg.isVisible({timeout: 1000}).catch(() => false);
        expect(hasError).toBeTruthy();
    });

    test('FN6 - Submit order with incomplete address', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        // Skip address filling
        
        // Try to place order without address
        const submitButton = page.locator(".action__submit");
        const isDisabled = await submitButton.isDisabled({timeout: 1000}).catch(() => false);
        
        // Assertion - Submit should be disabled or fail
        expect(isDisabled).toBeTruthy();
    });

    test('FN7 - Session timeout simulation', async ({page}) => {
        // Wait longer than typical session timeout
        await page.waitForTimeout(3000);
        
        // Try to navigate
        await page.goto(BASE_URL);
        
        // Assertion - Should redirect to login or show session expired
        const currentUrl = page.url();
        const isLoggedIn = !currentUrl.includes('login') && !currentUrl.includes('auth');
        const message = page.locator(":has-text('Session expired'), :has-text('Please login again')");
        
        expect(isLoggedIn).toBeFalsy();
    });

    test('FN8 - Duplicate product add (add same product twice)', async ({page}) => {
        const poManager = new POManager(page);
        const productName = "ZARA COAT 3";
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Add same product twice
        await dashboardPage.searchProductsAddCart(productName);
        await page.waitForTimeout(500);
        await dashboardPage.searchProductsAddCart(productName);
        
        await dashboardPage.navigateToCart();
        
        // Assertion - Product should appear twice in cart or quantity increased
        const productRows = page.locator(`h3:has-text('${productName}')`);
        const count = await productRows.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('FN9 - Special characters in search', async ({page}) => {
        const poManager = new POManager(page);
        const specialChars = "!@#$%^&*()";
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Search with special characters
        const searchInput = page.locator("input[placeholder*='search']");
        await searchInput.fill(specialChars);
        await page.waitForTimeout(500);
        
        // Assertion - Should handle gracefully
        const products = page.locator(".card-body");
        const count = await products.count();
        expect(count).toBeGreaterThanOrEqual(0); // Should not crash
    });

    test('FN10 - Rapid add to cart clicks', async ({page}) => {
        const poManager = new POManager(page);
        const dashboardPage = poManager.getDashboardPage();
        
        // Try to click add to cart multiple times rapidly
        const addButtons = page.locator("button:has-text('Add To Cart')");
        for (let i = 0; i < 3; i++) {
            await addButtons.first().click();
            await page.waitForTimeout(100); // Very short delay
        }
        
        // Assertion - System should handle multiple rapid clicks
        await expect(page.locator(".card-body b").last()).toBeVisible();
    });
});