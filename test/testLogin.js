var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

driver.get('http://localhost:1337/login');
driver.findElement(By.name('email')).sendKeys('elizabeth@test.com');
driver.findElement(By.name('password')).sendKeys('pa$$word');
driver.findElement(By.id('login')).click();
