const { test, expect } = require('@playwright/test')
const ExcelJs = require('exceljs');

async function writeExcelTest(sheetName,searchText,replaceText,change,filepath) {
    
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filepath);
    const worksheet = workbook.getWorksheet(sheetName);
    const output = await readExcelTest(worksheet, searchText);

    const cell = worksheet.getCell(output.row, output.col + change.colChange);
    cell.value = replaceText;
    await workbook.xlsx.writeFile(filepath);
}

async function readExcelTest(worksheet, searchText) {
    let output = { row: -1, col: -1 };
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value === searchText) {
                output.row = rowNumber;
                output.col = colNumber;
            }
        })
    })
    return output;
}


//writeExcelTest('Sheet1','Mango',350,{rowChange: 0, colChange: 2},'E:/Playwright/download.xlsx');

test('Upload and download excel xlxs test', async ({page}) => 
{
    const filepath = 'E:/Playwright/download.xlsx';
    const textSearch = 'Mango';
    const updatedText = '350';
    await page.goto("https://rahulshettyacademy.com/upload-download-test/index.html");

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button',{name: 'Download'}).click()
    ]);
    
    await download.saveAs(filepath);
    // ✅ Ensure the edit finishes before upload
    await writeExcelTest('Sheet1',textSearch,updatedText,{rowChange: 0, colChange: 2},filepath);
    await page.locator('#fileinput').click();
    await page.locator('#fileinput').setInputFiles(filepath);
    const textLocator = page.getByText(textSearch);
    const desiredRow = await page.getByRole('row').filter({has: textLocator});
    await expect(desiredRow.locator('#cell-4-undefined')).toHaveText(updatedText); 
});
