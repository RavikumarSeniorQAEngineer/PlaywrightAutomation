const {test, expect} = require('@playwright/test');


/*
If Id is present 
CSS -> tagname#id or #id

If class is present
CSS -> tagname.classname or .classname

Write Css based on any attribute 
CSS-> [attribute='value']
or [attribute*='value'] -> partial match
or tagName[attribute='value'] -> starts with

Write CSS with traversing from parent to child
css -> parenttagname >> childtagname

If needs to write the locator based on text
text=''

*/

test('First Playwright test', async ({browser})=>
{
    const context = await browser.newContext();
    const page = await context.newPage();
    const userName = page.locator("#username");
    const signIn = page.locator('#signInBtn');
    const cardTitles = page.locator(".card-body a");
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    console.log(await page.title());
    await userName.fill("rahulshetty");
    await page.locator("[type='password']").fill("Learning@830$3mK2");
    await signIn.click();
    console.log(await page.locator('[style*="block"]').textContent());
    await expect (page.locator('[style*="block"]')).toContainText('Incorrect');

    await userName.fill("");
    await userName.fill("rahulshettyacademy");
    await signIn.click();
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());
    const titles = await cardTitles.allTextContents();
    console.log(titles);
    
    

});

test('Page Playwright test', async ({page})=> 
{
    await page.goto("https://google.com/");
    console.log(await page.title());
    await expect(page).toHaveTitle('Google');
});

test('UI Controls', async ({page})=> 
{
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    console.log(await page.title());
    const userName = page.locator("#username");
    const signIn = page.locator('#signInBtn');
    const documentLink = page.locator("[href*='documents-request']");
    const dropdown = page.locator("select.form-control");   
    await dropdown.selectOption("consult");
    await page.locator(".radiotextsty").last().click();
    await page.locator("#okayBtn").click();

    await expect(page.locator(".radiotextsty").last()).toBeChecked();
    console.log(await page.locator(".radiotextsty").last().isChecked());

    await page.locator("#terms").click();
    await expect(page.locator("#terms")).toBeChecked();
    await page.locator("#terms").uncheck();
    expect(await page.locator("#terms").isChecked()).toBeFalsy();

    await expect(documentLink).toHaveAttribute('class', 'blinkingText');

    //await page.pause();  // for Debug

});


test('child windows handle', async ({browser}) =>
{
    const context = await browser.newContext();
    const page = await context.newPage();
    const documentLink = page.locator("[href*='documents-request']");
    const userName = page.locator("#username");
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

    // promise has 3 state -> pending, rejected, fulfilled
    // if we want to tie up we use promise.all

    const [newPage] = await Promise.all(
        [
            context.waitForEvent('page'), //listen for any new page
            documentLink.click(),  // new page will open on clicking this
        ]) 

    const text = await newPage.locator(".red").textContent();
    console.log(text);
    const arrayText = text.split("@");
    const domain = arrayText[1].split(" ")[0];
    // console.log(domain);
    // console.log(text.split("@")[1].split(" ")[0]);

    // await page.locator("#username").fill(domain);
    await userName.fill(domain);

    console.log(await userName.inputValue());
    //await page.pause();
});




