Feature: Ecommerce Validations
    @Regression
    Scenario: Placing the order
        Given A Login to ecommerce application with "learningplaywrighttoday@learning.com" and "Lear@123"
        When Add "ZARA COAT 3" to cart
        Then Verify that "ZARA COAT 3" is displayed in cart
        When Enter valid details and place the order with coupon "rahulshettyacademy" and email "learningplaywrighttoday@learning.com"
        Then Verify that order is present in the orderhistory

    # adding scenario 2 here to executre parallel test
    @Validation
    Scenario Outline: Placing the order
        Given A Login to ecommerce2 application with "<username>" and "<password>"
        Then Verify that error message is displayed

        Examples:
            | username      | password          |
            | rahulshetty   | Learning@830$3mK2 |
            | hello@123.com | Iamhello@12       |