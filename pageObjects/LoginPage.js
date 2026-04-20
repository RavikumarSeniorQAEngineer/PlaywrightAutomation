class LoginPage {

    constructor(page) {
        this.signInBtn = page.locator("[value='Login']")
        this.userName = page.locator("#userEmail");
        this.password = page.locator("#userPassword");
        this.page = page;
    }

    async clientLoginPage() 
    {
        await this.page.goto("https://rahulshettyacademy.com/client");
    }

    async validLogin(username, password){
        await this.userName.fill(username);
        await this.password.fill(password);
        await this.signInBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

}
module.exports = {LoginPage};