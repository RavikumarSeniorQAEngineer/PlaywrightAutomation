const {test, expect} = require("@playwright/test");

const BASE_URL      = 'https://eventhub.rahulshettyacademy.com'
// ── Credentials ────────────────────────────────────────────────────────────────
const USER_EMAIL    = 'learningplaywright@learning.com';// update email and password with your account
const USER_PASSWORD = 'Lear@123'; 
const FULL_NAME = 'LearningPlaywright';

async function Login(page) {
    // Navigate to login page if needed
    await page.goto(BASE_URL+"/login");
    
    // Fill in username and password
    await page.getByPlaceholder("you@email.com").fill(USER_EMAIL);
    await page.getByLabel("Password").fill(USER_PASSWORD);

    // Click login button
    await page.locator("#login-btn").click();

    // Browse Event is visible
    await expect(page.getByText("Browse Events →")).toBeVisible(); 
}

test('assignment 2: Single ticket booking is eligible for refund', async ({page})=>
{
    //Step 1 — Login
    await Login(page);
    await expect(page.getByText("Browse Events →")).toBeVisible();

    //Step 2 — Book first event with 1 ticket (default)
    // Navigate to events page
    await page.goto(BASE_URL+"/events");
    //book a first event
    await page.getByTestId("event-card").first().getByTestId("book-now-btn").click();
    // submit the deatils in booking page
    await page.getByLabel("Full Name").fill(FULL_NAME);
    await page.locator("#customer-email").fill(USER_EMAIL);
    await page.getByPlaceholder("+91 98765 43210").fill("+91 1234567891");
    await page.locator(".confirm-booking-btn").click();

    //Step 3 — Navigate to booking detail
    await page.getByText("View My Bookings").click();
    await expect(page).toHaveURL(BASE_URL+"/bookings");
    await page.getByTestId("booking-card").first().getByRole("button",{name : 'View Details'}).click();
    // Validate booking information text visible
    await expect(page.getByText("Booking Information")).toBeVisible();

    //Step 4 — Validate booking ref
    const bookingRef = (await page.locator(".font-mono.text-sm").innerText()).trim();
    const eventTitle = (await page.locator(".text-2xl.text-gray-900").innerText()).trim();
    expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));

    //Step 5 — Check refund eligibility
    await page.getByRole("button",{name: 'Check eligibility for refund?'}).click();
    await expect(page.locator("#refund-spinner")).toBeVisible();
    // Wait for spinner to disappear after 4s
    await expect(page.locator("#refund-spinner")).not.toBeVisible({ timeout: 6000 });

    //Step 6 — Validate result
    // spinner element
    // <div data-testid="refund-spinner" id="refund-spinner" class="flex items-center gap-3 text-sm text-gray-500" xpath="1"><span role="status" aria-label="Loading" class="
    
    const refundResult = page.getByTestId("refund-result");
    await expect(refundResult).toBeVisible();
    await expect(refundResult).toContainText("Eligible for refund.");
    await expect(refundResult).toContainText("Single-ticket bookings qualify for a full refund.");  
});

test('assignment 2: Group ticket booking is NOT eligible for refund', async ({page})=>
{
    //Step 1 — Login
    await Login(page);
    await expect(page.getByText("Browse Events →")).toBeVisible();

    //Step 2 — Book first event with 1 ticket (default)
    // Navigate to events page
    await page.goto(BASE_URL+"/events");
    //book a first event
    await page.getByTestId("event-card").first().getByTestId("book-now-btn").click();
    // submit the deatils in booking page
    await page.getByRole("button", {name: "+"}).click();
    await page.getByRole("button", {name: "+"}).click();
    await page.getByLabel("Full Name").fill(FULL_NAME);
    await page.locator("#customer-email").fill(USER_EMAIL);
    await page.getByPlaceholder("+91 98765 43210").fill("+91 1234567891");
    await page.locator(".confirm-booking-btn").click();

    //Step 3 — Navigate to booking detail
    await page.getByText("View My Bookings").click();
    await expect(page).toHaveURL(BASE_URL+"/bookings");
    await page.getByTestId("booking-card").first().getByRole("button",{name : 'View Details'}).click();
    // Validate booking information text visible
    await expect(page.getByText("Booking Information")).toBeVisible();

    //Step 4 — Validate booking ref
    const bookingRef = (await page.locator(".font-mono.text-sm").innerText()).trim();
    const eventTitle = (await page.locator(".text-2xl.text-gray-900").innerText()).trim();
    expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));

    //Step 5 — Check refund eligibility
    await page.getByRole("button",{name: 'Check eligibility for refund?'}).click();
    await expect(page.locator("#refund-spinner")).toBeVisible();
    // Wait for spinner to disappear after 4s
    await expect(page.locator("#refund-spinner")).not.toBeVisible({ timeout: 6000 });

    //Step 6 — Validate result (different assertions)
    const refundResult = page.getByTestId("refund-result");
    await expect(refundResult).toBeVisible();
    await expect(refundResult).toContainText("Not eligible for refund.");
    await expect(refundResult).toContainText("Group bookings (3 tickets) are non-refundable.");  

});