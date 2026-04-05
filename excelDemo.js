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


writeExcelTest('Sheet1','Mango',350,{rowChange: 0, colChange: 2},'E:/Playwright/download.xlsx');
