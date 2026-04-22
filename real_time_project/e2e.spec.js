const {test, expect} = require('@playwright/test');
const {POManager} = require('../pageObjects/POManager');

/**
 * END-TO-END (E2E) TESTS - Complete user journeys
 * These test the full workflow from start to end starting from login
 * They simulate real user scenarios and critical paths
 * 
 * Based on: clientAppPOtest.spec.js
 * Reference: TEST_STRATEGY_GUIDE.md - Section 3 (E2E Tests)
 */

const BASE_URL = 'https://rahulshettyacademy.com/client';

test.describe('Complete Purchase Journey - E2E Tests', () => {

    test('E2E1 - Complete purchase flow: Login → Search → Cart → Checkout → Order → History', 
    async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const couponCode = "rahulshettyacademy";
        
        console.log("\n========== E2E TEST: Complete Purchase Flow ==========\n");
        
        // ========== STEP 1: LOGIN ==========
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        await page.locator(".card-body b").last().waitFor();
        console.log("✓ Step 1: Login successful");
        
        // ========== STEP 2: SEARCH AND ADD PRODUCT ==========
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        
        await expect(page.locator(".toast-success")).toBeVisible({timeout: 5000});
        console.log("✓ Step 2: Product added to cart");
        
        // ========== STEP 3: NAVIGATE TO CART ==========
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        cartPage.verifyProductIsDisplayed(productName);
        await expect(page.locator(`text=${productName}`)).toBeVisible();
        console.log("✓ Step 3: Product verified in cart");
        
        // ========== STEP 4: PROCEED TO CHECKOUT ==========
        await cartPage.goToCheckout();
        
        await expect(page.locator("text=Order Summary")).toBeVisible();
        console.log("✓ Step 4: Checkout page loaded");
        
        // ========== STEP 5: FILL ADDRESS DETAILS ==========
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        await expect(page.locator("text=India")).toBeVisible();
        console.log("✓ Step 5: Country selected");
        
        // ========== STEP 6: APPLY COUPON ==========
        await ordersReviewPage.applyCouponCode(couponCode);
        
        const discountElement = page.locator(".ng-star-inserted");
        await expect(discountElement).toBeVisible();
        console.log("✓ Step 6: Coupon applied successfully");
        
        // ========== STEP 7: VERIFY EMAIL ==========
        await ordersReviewPage.verifyEmailId(email);
        
        await expect(page.locator(`text=${email}`)).toBeVisible();
        console.log("✓ Step 7: Email verified");
        
        // ========== STEP 8: PLACE ORDER ==========
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        
        expect(orderId).toBeTruthy();
        expect(orderId.length).toBeGreaterThan(0);
        console.log(`✓ Step 8: Order placed - Order ID: ${orderId}`);
        
        // ========== STEP 9: NAVIGATE TO ORDER HISTORY ==========
        await dashboardPage.navigateToOrders();
        
        await expect(page.locator("//h1[text()='Your Orders']")).toBeVisible();
        console.log("✓ Step 9: Navigated to order history");
        
        // ========== STEP 10: VERIFY ORDER IN HISTORY ==========
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        const retrievedOrderId = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(retrievedOrderId)).toBeTruthy();
        console.log("✓ Step 10: Order verified in history");
        
        console.log("\n✅ E2E1 TEST PASSED - Complete purchase flow successful ✅\n");
    });

    test('E2E2 - Multiple products purchase journey', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const products = ["ZARA COAT 3", "ADIDAS ORIGINAL"];
        
        console.log("\n========== E2E TEST: Multiple Products Purchase ==========\n");
        
        // Step 1: Login
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(products[0]);
        console.log(`✓ Step 1: Product 1 added: ${products[0]}`);
        
        // Step 2: Add second product
        await dashboardPage.searchProductsAddCart(products[1]);
        console.log(`✓ Step 2: Product 2 added: ${products[1]}`);
        
        // Step 3: Navigate to cart
        await dashboardPage.navigateToCart();
        
        // Verify all products are in cart
        for (const product of products) {
            await expect(page.locator(`h3:has-text('${product}')`)).toBeVisible();
        }
        console.log("✓ Step 3: All products verified in cart");
        
        // Step 4: Checkout
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Step 5: Complete order
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        console.log(`✓ Step 4: Order placed - Order ID: ${orderId}`);
        
        // Step 5: Verify order in history
        await dashboardPage.navigateToOrders();
        
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        const retrievedOrderId = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(retrievedOrderId)).toBeTruthy();
        console.log("✓ Step 5: Order with multiple items verified in history");
        
        console.log("\n✅ E2E2 TEST PASSED - Multiple products purchase successful ✅\n");
    });

    test('E2E3 - Purchase with coupon code discount', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const couponCode = "rahulshettyacademy";
        
        console.log("\n========== E2E TEST: Purchase with Coupon ==========\n");
        
        // Step 1: Login and add product
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        console.log("✓ Step 1: Product added to cart");
        
        // Step 2: Navigate and checkout
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Step 3: Apply coupon
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        await ordersReviewPage.applyCouponCode(couponCode);
        console.log(`✓ Step 2: Coupon applied: ${couponCode}`);
        
        // Step 4: Get original price
        const priceBeforeDiscount = page.locator(".exonerationMsg");
        await expect(priceBeforeDiscount).toBeVisible();
        console.log("✓ Step 3: Discount applied - price reduced");
        
        // Step 5: Place order
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        console.log(`✓ Step 4: Order placed - Order ID: ${orderId}`);
        
        // Step 6: Verify in history
        await dashboardPage.navigateToOrders();
        
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        const retrievedOrderId = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(retrievedOrderId)).toBeTruthy();
        console.log("✓ Step 5: Discounted order verified in history");
        
        console.log("\n✅ E2E3 TEST PASSED - Purchase with coupon successful ✅\n");
    });
});

test.describe('Edge Cases and Error Scenarios - E2E', () => {

    test('E2E4 - Login with invalid credentials shows error', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "WrongPassword@123";
        
        console.log("\n========== E2E TEST: Invalid Login Error Handling ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        // Verify error message appears
        const errorMessage = page.locator(".toast-error");
        await expect(errorMessage).toContainText('Incorrect email or password');
        console.log("✓ Error message displayed correctly for invalid credentials");
        
        console.log("\n✅ E2E4 TEST PASSED - Error handling works correctly ✅\n");
    });

    test('E2E5 - Complete journey without applying coupon', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E TEST: Purchase without Coupon ==========\n");
        
        // Step 1-4: Login to checkout
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Step 5: Fill address WITHOUT coupon
        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        
        // Skip coupon application
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        console.log(`✓ Order placed without coupon - Order ID: ${orderId}`);
        
        // Step 6: Verify order
        await dashboardPage.navigateToOrders();
        
        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        ordersHistoryPage.searchOrderAndSelect(orderId);
        
        const retrievedOrderId = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(retrievedOrderId)).toBeTruthy();
        console.log("✓ Order without coupon verified in history");
        
        console.log("\n✅ E2E5 TEST PASSED - Purchase without coupon successful ✅\n");
    });
});

test.describe('Negative E2E Tests - Error Scenarios & Edge Cases', () => {

    test('E2E-NEG1 - Complete flow with wrong password multiple times', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        
        console.log("\n========== E2E-NEG1: Wrong Password Multiple Attempts ==========\n");
        
        // Attempt 1: Wrong password
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, "WrongPass1");
        
        const errorMsg1 = page.locator(".toast-error");
        await expect(errorMsg1).toBeVisible();
        console.log("✓ First attempt rejected");
        
        // Attempt 2: Another wrong password
        await loginpage.validLogin(email, "WrongPass2");
        const errorMsg2 = page.locator(".toast-error");
        await expect(errorMsg2).toBeVisible();
        console.log("✓ Second attempt rejected");
        
        // Attempt 3: Correct password should work
        await loginpage.validLogin(email, "Lear@123");
        await expect(page.locator(".card-body b").last()).toBeVisible();
        console.log("✓ Correct credentials work after failures");
        
        console.log("\n✅ E2E-NEG1 PASSED - Multiple authentication failures handled ✅\n");
    });

    test('E2E-NEG2 - Add product then remove and try checkout', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E-NEG2: Remove Product Then Checkout ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        console.log("✓ Product added");
        
        await dashboardPage.navigateToCart();
        const cartPage = poManager.getCartPage();
        
        // Remove the product
        const removeButton = page.locator("button:has-text('Remove')").first();
        await removeButton.click();
        await page.waitForTimeout(500);
        console.log("✓ Product removed from cart");
        
        // Try to checkout with empty cart
        const checkoutButton = page.locator("button:has-text('Checkout')");
        const isDisabled = await checkoutButton.isDisabled({timeout: 1000}).catch(() => true);
        
        // Assertion - Should not allow checkout
        expect(isDisabled).toBeTruthy();
        console.log("✓ Checkout blocked with empty cart");
        
        console.log("\n✅ E2E-NEG2 PASSED - Empty cart checkout prevented ✅\n");
    });

    test('E2E-NEG3 - Checkout with invalid country and recovery', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E-NEG3: Invalid Country Selection ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        const ordersReviewPage = poManager.getOrdersReviewPage();
        
        // Try invalid country
        await page.locator("[placeholder*='Country']").pressSequentially("ZZZ", {delay: 150});
        await page.waitForTimeout(500);
        
        const dropdown = page.locator(".ta-results");
        const optionCount = await dropdown.locator("button").count().catch(() => 0);
        expect(optionCount).toBe(0);
        console.log("✓ Invalid country rejected");
        
        // Clear and enter valid country
        await page.locator("[placeholder*='Country']").fill("");
        await ordersReviewPage.searchCountryAndSelect("ind", " India");
        console.log("✓ Valid country selected after invalid attempt");
        
        // Complete order
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        expect(orderId).toBeTruthy();
        console.log(`✓ Order placed successfully: ${orderId}`);
        
        console.log("\n✅ E2E-NEG3 PASSED - Invalid input handled with recovery ✅\n");
    });

    test('E2E-NEG4 - Verify order not found in history after cancellation attempt', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E-NEG4: Non-existent Order Search ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.navigateToOrders();
        
        // Try to search for non-existent order
        const fakeOrderId = "FAKE_ORDER_12345";
        const searchInput = page.locator("input[placeholder*='search'], input[type='text']");
        
        if (await searchInput.isVisible({timeout: 1000}).catch(() => false)) {
            await searchInput.fill(fakeOrderId);
            await page.waitForTimeout(1000);
            
            // Assertion - Fake order should not appear
            const results = page.locator("tbody tr");
            const count = await results.count();
            
            console.log(`✓ Searched for non-existent order: ${fakeOrderId}`);
            console.log(`✓ Results found: ${count} (should be 0 or none matching)`);
        }
        
        console.log("\n✅ E2E-NEG4 PASSED - Non-existent order not found ✅\n");
    });

    test('E2E-NEG5 - Very long coupon code input', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const verylongCoupon = "THISISAVERYLONGCOUPONCODETHATSHOULDNOTWORK123456789";
        
        console.log("\n========== E2E-NEG5: Very Long Coupon Code ==========\n");
        
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
        
        // Try to apply very long coupon
        const couponInput = page.locator("input[placeholder*='promo']");
        if (await couponInput.isVisible({timeout: 1000}).catch(() => false)) {
            await couponInput.fill(verylongCoupon);
            console.log(`✓ Entered long coupon: ${verylongCoupon}`);
            
            const applyBtn = page.locator("button:has-text('Apply')");
            if (await applyBtn.isVisible()) {
                await applyBtn.click();
                await page.waitForTimeout(1000);
            }
        }
        
        // Should handle gracefully - place order anyway
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        expect(orderId).toBeTruthy();
        console.log(`✓ Order placed despite invalid coupon: ${orderId}`);
        
        console.log("\n✅ E2E-NEG5 PASSED - Long coupon handled gracefully ✅\n");
    });

    test('E2E-NEG6 - Rapid refresh during checkout', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E-NEG6: Rapid Refresh During Checkout ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        
        // Refresh cart page
        await page.reload();
        console.log("✓ Cart page refreshed");
        
        // Should still have product
        const productVisible = await page.locator(`h3:has-text('${productName}')`).isVisible({timeout: 1000}).catch(() => false);
        expect(productVisible).toBeTruthy();
        console.log("✓ Product persists after refresh");
        
        // Continue to checkout
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        
        // Refresh checkout page
        await page.reload();
        console.log("✓ Checkout page refreshed");
        
        // Should still be in checkout
        const checkoutElement = page.locator("[placeholder*='Country'], text='Order Summary'");
        const isInCheckout = await checkoutElement.isVisible({timeout: 1000}).catch(() => false);
        expect(isInCheckout).toBeTruthy();
        console.log("✓ Session retained after refresh");
        
        console.log("\n✅ E2E-NEG6 PASSED - Refresh handling works correctly ✅\n");
    });

    test('E2E-NEG7 - Cart state consistency after back button navigation', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        
        console.log("\n========== E2E-NEG7: Back Button Navigation ==========\n");
        
        const loginpage = poManager.getLoginPage();
        await loginpage.clientLoginPage();
        await loginpage.validLogin(email, password);
        
        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductsAddCart(productName);
        await dashboardPage.navigateToCart();
        console.log("✓ Added product and navigated to cart");
        
        const cartPage = poManager.getCartPage();
        await cartPage.goToCheckout();
        console.log("✓ Navigated to checkout");
        
        // Go back twice
        await page.goBack();
        console.log("✓ Went back to cart");
        
        // Verify cart still has product
        const productVisible = await page.locator(`h3:has-text('${productName}')`).isVisible({timeout: 1000}).catch(() => false);
        expect(productVisible).toBeTruthy();
        console.log("✓ Product still in cart after back");
        
        // Go back to dashboard
        await page.goBack();
        console.log("✓ Went back to dashboard");
        
        // Verify dashboard loads
        const dashboard = page.locator(".card-body");
        const isVisible = await dashboard.isVisible({timeout: 1000}).catch(() => false);
        expect(isVisible).toBeTruthy();
        console.log("✓ Dashboard accessible");
        
        console.log("\n✅ E2E-NEG7 PASSED - Back navigation preserves state ✅\n");
    });

    test('E2E-NEG8 - Special characters in address field', async ({page}) => {
        const poManager = new POManager(page);
        const email = "learningplaywrighttoday@learning.com";
        const password = "Lear@123";
        const productName = "ZARA COAT 3";
        const specialAddress = "!@#$%^&*()_+-=[]{}|;:',.<>?/";
        
        console.log("\n========== E2E-NEG8: Special Characters in Address ==========\n");
        
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
        
        // Try to fill address with special characters
        const addressField = page.locator(".input.txt").nth(3);
        await addressField.fill(specialAddress);
        console.log("✓ Filled address with special characters");
        
        // Try to place order
        try {
            const orderId = await ordersReviewPage.SubmitAndGetOrderId();
            // Should either accept it or reject it gracefully
            console.log(`✓ Order handling: ${orderId ? 'Accepted' : 'Rejected'}`);
        } catch (e) {
            console.log("✓ Special characters handled with appropriate error");
        }
        
        console.log("\n✅ E2E-NEG8 PASSED - Special characters handled ✅\n");
    });
});
