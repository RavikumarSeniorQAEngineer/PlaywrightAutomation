const base = require("@playwright/test");

exports.customtest = base.test.extend({
    testDataForOrder : {
        userName: "learningplaywrighttoday@learning.com",
        password: "Lear@123",
        productName: "ZARA COAT 3",
        couponCode: "rahulshettyacademy"
    }
});


//const {test} = require("@playwright/test");

// exports.customtest = test.extend({
//     testDataForOrder : {
//         userName: "learningplaywrighttoday@learning.com",
//         password: "Lear@123",
//         productName: "ZARA COAT 3",
//         couponCode: "rahulshettyacademy"
//     }
// });