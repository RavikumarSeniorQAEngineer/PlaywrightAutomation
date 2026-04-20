const { expect } = require("@playwright/test");

class OrdersReviewPage {
    constructor(page) {
        this.page = page;
        this.country = page.locator("[placeholder*='Country']");
        this.dropdown = page.locator(".ta-results");
        this.coupon = page.locator(".input.txt");
        this.applyCouponBtn = page.locator(".btn.btn-primary.mt-1");
        this.emailId = page.locator(".user__name [type='text']").first();
        this.submit = page.locator(".action__submit");
        this.orderConfirmationText = page.locator(".hero-primary");
        this.orderId = page.locator(".em-spacer-1 .ng-star-inserted");
    }

    async searchCountryAndSelect(countryCode, countryName) {
        await this.country.pressSequentially(countryCode, { delay: 150 });
        await this.dropdown.waitFor();
        const dropdownOptionsCount = await this.dropdown.locator("button").count();
        for (let i = 0; i < dropdownOptionsCount; ++i) {
            const text = await this.dropdown.locator("button").nth(i).textContent();
            if (text === countryName) {
                await this.dropdown.locator("button").nth(i).click();
                break;
            }
        }
    }

    async verifyEmailId(userName) {
        await expect(this.emailId).toHaveText(userName);
    }

    async applyCouponCode(couponCode){
        await this.coupon.nth(3).fill(couponCode);
        await this.applyCouponBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async SubmitAndGetOrderId() {
        await this.submit.click();
        await expect(this.orderConfirmationText).toHaveText(" Thankyou for the order. ");
        return await this.orderId.textContent();
    }
}
module.exports = {OrdersReviewPage};