var webdriver = require("selenium-webdriver");
var until = webdriver.until;
var By = webdriver.By;
var Key = webdriver.Key;
var element = webdriver.WebElement;

/* Helper Functions */

async function getElement(driver, xpath) {
  let webElements = await driver.findElements(By.xpath(xpath));
  if (webElements.length != 0) {
    return webElements[0];
  } else {
    throw new Error(`ERROR: getElement: Unable to find ${xpath}`);
  }
}

async function getElements(driver, xpath) {
  let webElements = await driver.findElements(By.xpath(xpath));
  if (webElements.length != 0) {
    return webElements;
  } else {
    throw new Error(`ERROR: getElements: Unable to find ${xpath}`);
  }
}

async function getSubElement(parentElement, xpath) {
  return await parentElement.findElement(By.xpath(xpath));
}

async function IsDisplayed(webElements) {
  if (webElements.length != 0 && (await webElements[0].isDisplayed())) {
    return true;
  } else {
    return false;
  }
}

async function waitFor(driver, xpath) {
  await driver.wait(until.elementsLocated(By.xpath(xpath)), 40000);
}

module.exports = {
  getElement,
  getElements,
  getSubElement,
  IsDisplayed,
  waitFor,
};
