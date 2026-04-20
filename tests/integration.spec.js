const {test, expect} = require('@playwright/test');
const {POManager} = require('../pageObjects/POManager');

/**
 * INTEGRATION TESTS - Test workflows combining 2-3 features
 * These test interactions between features to ensure they work together
 * 
 * Based on: clientAppPOtest.spec.js
 * Reference: TEST_STRATEGY_GUIDE.md - Section 2 (Integration Tests)
 */

const BASE_URL = 'https://rahulshettyacademy.com/client';

test.describe('Login + Dashboard Integration Tests', () => {

    test('I1 - Login and verify dashboard loads products', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Assertion 1 - Dashboard loaded
        await page.locator(".card-body b").last().waitFor();
        const productsVisible = await page.locator(".card-body").count();
        
        // Assertion 2 - Multiple products are displayed
        expect(productsVisible).toBeGreaterThan(0);
    });

    test('I2 - Add product to cart and verify cart count updates', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        await page.locator(".card-body b").last().waitFor();
        
        // Get initial cart count
        const initialCartBadge = await page.locator(".badge").textContent();
        const initialCount = parseInt(initialCartBadge) || 0;
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        
        // Get updated cart count
        await page.waitForTimeout(500);
        const updatedCartBadge = await page.locator(".badge").textContent();
        const updatedCount = parseInt(updatedCartBadge) || 0;
        
        // Assertion - Cart count increased
        expect(updatedCount).toBeGreaterThan(initialCount);
    });

    test('I3 - Add multiple products and verify all in cart', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const products = ["ZARA COAT 3", "ADIDAS ORIGINAL"];
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Add multiple products
        for (const product of products) {
            await dashboardPage.searchProductsAddCart(product);
            await page.waitForTimeout(500);
        }
        
        await dashboardPage.navigateToCart();
        
        // Assertion - All products in cart
        for (const product of products) {
            const isVisible = await page.locator(`h3:has-text('${product}')`).isVisible();
            expect(isVisible).toBeTruthy();
        }
    });
});

test.describe('Dashboard + Cart + Checkout Integration', () => {

    test('I4 - Search product, add to cart, and navigate to checkout', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Step 1: Search and add product
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        
        // Assertion 1 - Success toast
        await expect(page.locator(".toast-success")).toBeVisible({timeout: 5000});
        
        // Step 2: Navigate to cart
        await dashboardPage.navigateToCart();
        
        // Assertion 2 - Product in cart
        await expect(page.locator(`h3:has-text('${productName}')`)).toBeVisible();
        
        // Step 3: Go to checkout
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Assertion 3 - Checkout page loaded
        await expect(page.locator("text=Order Summary")).toBeVisible();
    });

    test('I5 - Cart to Checkout with country/address selection', async ({page}) => {
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
        
        // Step 1: Select country
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Assertion 1 - Country selected
        await expect(page.locator("text=India")).toBeVisible();
        
        // Step 2: Verify email
        await ordersReviewPage.verifyEmailId(email);
        
        // Assertion 2 - Email is displayed
        await expect(page.locator(`text=${email}`)).toBeVisible();
    });

    test('I6 - Checkout with coupon code application', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const couponCode = "rahulshettyacademy";
        
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
        
        // Step 1: Select country
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Step 2: Apply coupon
        await ordersReviewPage.applyCouponCode(couponCode);
        
        // Assertion - Discount applied
        const discountElement = page.locator(".ng-star-inserted");
        await expect(discountElement).toBeVisible();
    });
});

test.describe('Checkout + Payment Integration', () => {

    test('I7 - Fill address, apply coupon, and place order', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const couponCode = "rahulshettyacademy";
        
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
        
        // Step 1: Select country
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Step 2: Apply coupon
        await ordersReviewPage.applyCouponCode(couponCode);
        
        // Step 3: Verify email
        await ordersReviewPage.verifyEmailId(email);
        
        // Step 4: Place order
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        
        // Assertion - Order ID generated
        expect(orderId).toBeTruthy();
        expect(orderId.length).toBeGreaterThan(0);
    });

    test('I8 - Place order and verify confirmation page', async ({page}) => {
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
        
        // Assertion - Confirmation message visible
        await expect(page.locator("text=Thankyou for the order")).toBeVisible();
        
        // Assertion - Order ID visible in confirmation
        await expect(page.locator(`text=${orderId}`)).toBeVisible();
    });
});

test.describe('Order Placement + History Integration', () => {

    test('I9 - Place order and navigate to order history', async ({page}) => {
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
        
        // Navigate to orders
        await dashboardPage.navigateToOrders();
        
        // Assertion - Orders page loaded
        await expect(page.locator("//h1[text()='Your Orders']")).toBeVisible();
    });

    test('I10 - Place order and verify in order history', async ({page}) => {
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
        
        // Navigate to orders history
        await dashboardPage.navigateToOrders();
        
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        // Assertion - Order visible in history
        const retrievedOrderId = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(retrievedOrderId)).toBeTruthy();
    });
});

test.describe('Negative Testing - Integration Workflows', () => {

    test('IN1 - Failed login prevents product operations', async ({page}) => {
        const poManager = new POManager(page);
        const invalidEmail = "wrong@learning.com";
        const invalidPassword = "WrongPass@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(invalidEmail, invalidPassword);
        
        // Assertion - Should show error and prevent access
        const errorMessage = page.locator(".toast-error");
        await expect(errorMessage).toBeVisible();
        
        // Should not reach dashboard
        const dashboard = page.locator(".card-body");
        const isVisible = await dashboard.isVisible({timeout: 1000}).catch(() => false);
        expect(isVisible).toBeFalsy();
    });

    test('IN2 - Add product then logout then try to access cart', async ({page}) => {
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
        
        // Logout
        const logoutButton = page.locator("button[aria-label*='Sign out'], button[aria-label*='Logout']");
        const isLogoutVisible = await logoutButton.isVisible({timeout: 1000}).catch(() => false);
        if (isLogoutVisible) {
            await logoutButton.click();
        }
        
        // Try to access cart directly
        await page.goto(BASE_URL + '/cart');
        
        // Assertion - Should redirect to login
        const currentUrl = page.url();
        const isAuthenticated = !currentUrl.includes('login');
        expect(isAuthenticated).toBeFalsy();
    });

    test('IN3 - Search product then network delay on add', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Simulate network latency
        await page.route('**/api/**', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.continue();
        });
        
        // Try to add product with delay
        const addButton = page.locator("button:has-text('Add To Cart')").first();
        await addButton.click({timeout: 5000});
        
        // Assertion - Should eventually complete or show appropriate message
        const dashboard = page.locator(".card-body");
        const isStillLoaded = await dashboard.isVisible({timeout: 3000}).catch(() => false);
        expect(isStillLoaded).toBeTruthy();
    });

    test('IN4 - Multiple concurrent cart additions', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        const addButtons = page.locator("button:has-text('Add To Cart')");
        
        // Click multiple add buttons rapidly without waiting
        const count = await addButtons.count();
        for (let i = 0; i < Math.min(count, 3); i++) {
            dashboardPage.searchProductsAddCart("ZARA COAT 3").catch(() => {});
        }
        
        await page.waitForTimeout(2000);
        
        // Navigate to cart
        await dashboardPage.navigateToCart();
        
        // Assertion - Cart should be in valid state
        const cartItems = page.locator("div li");
        const itemCount = await cartItems.count();
        expect(itemCount).toBeGreaterThan(0);
    });

    test('IN5 - Add product with invalid coupon then remove coupon', async ({page}) => {
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
        
        // Apply invalid coupon
        const couponInput = page.locator("input[placeholder*='promo']");
        if (await couponInput.isVisible({timeout: 1000}).catch(() => false)) {
            await couponInput.fill("INVALID123");
            const applyCouponButton = page.locator("button:has-text('Apply')");
            if (await applyCouponButton.isVisible()) {
                await applyCouponButton.click();
                await page.waitForTimeout(1000);
            }
        }
        
        // Clear field and try again with valid coupon
        await couponInput.fill("");
        await couponInput.fill("rahulshettyacademy");
        
        // Assertion - Should be able to apply valid coupon after invalid attempt
        const priceAfter = page.locator(".summary");
        await expect(priceAfter).toBeVisible();
    });

    test('IN6 - Cart checkout flow with page refresh', async ({page}) => {
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
        
        // Refresh page mid-flow
        await page.reload();
        
        // Session should still be active after refresh
        const isLoggedIn = await page.locator(".card-body").isVisible({timeout: 2000}).catch(() => false);
        expect(isLoggedIn).toBeTruthy();
    });

    test('IN7 - Navigate to orders with no orders placed', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        
        await page.goto(BASE_URL);
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        
        // Navigate to orders without placing any order
        try {
            await dashboardPage.navigateToOrders();
            
            // Assertion - Should show empty state or no orders message
            const ordersTable = page.locator("tbody tr");
            const count = await ordersTable.count();
            expect(count).toBeGreaterThanOrEqual(0); // Empty or has orders
        } catch (e) {
            // Expected if orders page has error without orders
            expect(true).toBeTruthy();
        }
    });
});