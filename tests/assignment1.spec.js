const {test, expect} = require('@playwright/test');

async function Login(page, baseurl,email,password) {
    // Navigate to login page if needed
    await page.goto(baseurl+"/login");
    
    // Fill in username and password
    await page.getByPlaceholder("you@email.com").fill(email);
    await page.getByLabel("Password").fill(password);

    // Click login button
    await page.locator("#login-btn").click();
}

test('assignment 1 event page', async ({page})=>
{
    const baseurl = "https://eventhub.rahulshettyacademy.com";
    const email = "learningplaywright@learning.com";
    const password = "Lear@123";
    const eventTitle = `Test Event ${Date.now()}`;
    const date = new Date()
    date.setFullYear(2027);
    const futherdate = date.toISOString().slice(0, 16); 

    await Login(page, baseurl, email, password);
    await expect(page.getByText("Browse Events →")).toBeVisible();

    await page.goto(baseurl+"/admin/events");
    await page.locator("#event-title-input").fill(eventTitle);
    await page.locator("#admin-event-form textarea").fill("This is a test event created by Playwright");
    await page.getByLabel("City").fill("Bangalore");
    await page.getByLabel('Category*').selectOption('Workshop');
    await page.getByLabel("Venue").fill("Test Venue Bangalore");
    await page.getByLabel("Event Date & Time").fill(futherdate);
    await page.getByLabel("Price ($)").fill("100");
    await page.getByLabel('Total Seats').fill("50");
    await page.locator("#add-event-btn").click();
    await expect(page.getByText('Event created!')).toBeVisible();
    //await expect(page.locator('body')).toMatchAriaSnapshot(`- paragraph: Event created!`);

    await page.goto(baseurl+"/events");
    const eventsCards = page.getByTestId("event-card");
    await expect(eventsCards.first()).toBeVisible();
    const filteredCard = eventsCards.filter({hasText: eventTitle});
    await expect(filteredCard).toBeVisible({timeout: 5000});
    const seatText = await filteredCard.locator('.text-emerald-600').textContent();
    const seatsBeforeBooking = parseInt(seatText.match(/\d+/)[0]);
    await filteredCard.getByTestId("book-now-btn").click();

    await expect(page.locator('#ticket-count')).toHaveText("1");
    await page.getByLabel("Full Name").fill("LearningPlaywright");
    await page.locator("#customer-email").fill(email);
    await page.getByPlaceholder("+91 98765 43210").fill("+91 1234567891");
    await page.locator(".confirm-booking-btn").click();

    const bookingRefLocator = page.locator(".booking-ref").first();
    await expect(bookingRefLocator).toBeVisible();
    const bookingRef = (await bookingRefLocator.innerText()).trim();
    console.log(bookingRef);

    await page.getByText("View My Bookings").click();
    await expect(page).toHaveURL(baseurl+"/bookings");

    const bookingCards = page.locator("#booking-card");
    await expect(bookingCards.first()).toBeVisible();
    const bookingCard = bookingCards.filter({hasText: bookingRef});
    await expect(bookingCard).toBeVisible();
    await expect(bookingCard.locator(".text-gray-900.mb-1")).toHaveText(eventTitle);

    await page.goto(baseurl+"/events");
    await expect(eventsCards.first()).toBeVisible();
    await expect(filteredCard).toBeVisible({timeout: 5000});
    const afterSeatText = await filteredCard.locator('.text-emerald-600').textContent();
    const seatsAfterBooking = parseInt(afterSeatText.match(/\d+/)[0]);
    expect(seatsBeforeBooking - seatsAfterBooking).toEqual(1);
    expect(seatsAfterBooking === seatsBeforeBooking - 1).toBeTruthy();

});