Feature: Error Validation
    @Validation
    Scenario Outline: Placing the order
        Given A Login to ecommerce2 application with "<username>" and "<password>"
        Then Verify that error message is displayed

        Examples:
            | username      | password           |
            | rahulshetty   | Learning@830$3mK2  |
            | hello@123.com | Iamhello@12        |