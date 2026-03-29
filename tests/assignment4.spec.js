const { test, expect, request } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const API_BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api/';

const USER_EMAIL1 = 'learningplaywright@yahoo.com';
const USER_PASSWORD1 = 'Lear@123';

const USER_EMAIL2 = 'learningplaywright@gmail.com';
const USER_PASSWORD2 = 'Lear@123';

const query = {
    page: 1,
    limit: 12
}

let yahooToken;
let eventId;
let bookingId;

async function Login(page) {
    // Navigate to login page if needed
    await page.goto(BASE_URL+"/login");
    
    // Fill in username and password
    await page.getByPlaceholder("you@email.com").fill(USER_EMAIL2);
    await page.getByLabel("Password").fill(USER_PASSWORD2);

    // Click login button
    await page.locator("#login-btn").click();
}

test(" 'Access Denied' error message validation", async ({page}) => {

    // Step 1 — Login as Yahoo user via API
    const apiContext = await request.newContext();
    const loginResponse = await apiContext.post(API_BASE_URL + '/auth/login', {
        data: { email: USER_EMAIL1, password: USER_PASSWORD1 }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginResponseJSON = await loginResponse.json();
    yahooToken = loginResponseJSON.token;

    // Step 2 — Fetch events via API to get a valid event ID
    const eventsResponse = await apiContext.get(API_BASE_URL + '/events', {
        headers: {
            Authorization: `Bearer ${yahooToken}`
        },
        params: query
    });
    expect(eventsResponse.ok()).toBeTruthy();
    const eventResponseJSON = await eventsResponse.json();
    eventId = eventResponseJSON.data[0].id;

    // Step 3 — Create a booking via API as Yahoo user
    const bookingResponse = await apiContext.post(API_BASE_URL + '/bookings', {
        headers: {
            Authorization: `Bearer ${yahooToken}`
        },
        data: {
            eventId: `${eventId}`,
            customerName: "Priya Sharma",
            customerEmail: `${USER_EMAIL1}`,
            customerPhone: "+91-9876543211",
            quantity: 1
        }
    });
    expect(bookingResponse.ok()).toBeTruthy();
    const bookingResponseJSON =  await bookingResponse.json();
    bookingId = bookingResponseJSON.data.id;

    //Step 4 — Login as Gmail user via browser UI
    await Login(page);
    await expect(page.getByText("Browse Events →")).toBeVisible();

    // Step 5 — Navigate to Yahoo's booking URL as Gmail user
    await page.goto(`${BASE_URL}/bookings/${bookingId}`);
    await page.waitForLoadState("networkidle");

    // Step 6 — Validate Access Denied
    await expect(page.getByText('Access Denied', { exact: true })).toBeVisible();
    await expect(page.getByText('You are not authorized to view this booking.', { exact: true})).toBeVisible();

    // Step 7 - Delete Booking for cleaning test data
    const deleteResponse = await apiContext.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
            Authorization: `Bearer ${yahooToken}`,
            'Content-Type': 'application/json'
        }
    });
    expect(deleteResponse.ok()).toBeTruthy();
});