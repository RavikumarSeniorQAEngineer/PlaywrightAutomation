const {test, expect} = require("@playwright/test");

test('Calendar date picker test',async ({page}) =>
{
    const monthNumber = "6";
    const date = "15";
    const year = "2027";

    const expectedList = [monthNumber, date, year];

    await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/offers");
    await page.locator(".react-date-picker__inputGroup").click();
    await page.locator(".react-calendar__navigation__label").click();
    await page.locator(".react-calendar__navigation__label").click();
    await page.getByText("2027").click();
    await page.locator(".react-calendar__year-view__months__month").nth(Number(monthNumber)-1).click();
    await page.locator("//abbr[text()='"+date+"']").click();

     console.log(await page.locator("input[name='date']").first().inputValue());
    // await expect(page.locator("input[name='date']").first()).toHaveValue(year+"-"+monthNumber.padStart(2,'0')+"-"+date.padStart(2,'0'));

    const input = page.locator(".react-date-picker__inputGroup input");
    for(let i=0; i < expectedList.length; ++i)
    {
        const value = await input.nth(i+1).inputValue();
        expect(value).toEqual(expectedList[i]);
    }
    

    
});