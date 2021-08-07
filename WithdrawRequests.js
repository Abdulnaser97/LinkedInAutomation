var webdriver = require("selenium-webdriver");
require("geckodriver");
var firefox = require("selenium-webdriver/firefox");
const { logConnections } = require("./connectionsLog");
const Login = require("./Login");

var until = webdriver.until;
var By = webdriver.By;
var Key = webdriver.Key;
var element = webdriver.WebElement;

const URL = "https://www.linkedin.com/mynetwork/invitation-manager/sent/";

// Array of connObject {name,href} to be exported to the xlsx sheet
let withdrawalsSummary = [];

async function withdrawRequests(driver) {
  try {
    let pageNumber = 1;
    while (true) {
      let pageURL =
        pageNumber === 1 ? URL : URL + `?invitationType=&page=${pageNumber}`;

      await driver.get(pageURL);

      await Login(driver);

      await driver.wait(function () {
        return driver
          .executeScript("return document.readyState")
          .then(function (readyState) {
            return readyState === "complete";
          });
      });

      // Wait for any of the 3 buttons (i.e. wait for the page to fully load). Regular page load here won't work due to LinkedIn's async API calls post page load
      await driver
        .wait(
          until.elementsLocated(
            By.xpath("//span[text()[contains(.,'Withdraw')]]")
          ),
          5000
        )
        .then(async () => {
          await cancelRequests(driver);
        });

      // Check if there exists a next page by checking if the Next button is enabled
      let nextButtons = await driver.findElements(
        By.xpath("//button[.//*[text()='Next']]")
      );
      let isThereNextPage = false;
      if (nextButtons.length != 0) {
        await nextButtons[0].isEnabled().then((isEnabled) => {
          isThereNextPage = isEnabled;
        });
      }
      // If no next page exists, log connections to xlsx sheet and exit
      if (!isThereNextPage) {
        logConnections(withdrawalsSummary);
        break;
      }
      // If there exists additional pages, move to next page.
      pageNumber++;
    }
  } catch (e) {
    console.log(e);
  }
}

// Cancel connection requests that haven't been approved for more that a week
// and store them in an excel sheet
async function cancelRequests(driver) {
  try {
    let invitationCards = await driver.findElements(
      By.xpath("//*[@class='invitation-card artdeco-list__item ember-view']")
    );

    for (let i = 0; i < invitationCards.length; i++) {
      let requestAge = await invitationCards[i].findElements(
        By.xpath(".//time[text()[contains(.,'weeks')]]")
      );

      // If request has been sent for more than a week, store the name in excel sheet and withdraw invitation
      if (requestAge.length != 0) {
        //await invitationCards[i].findElement(By.xpath(".//span[text()[contains(.,'Withdraw')]]")).click();
        var href;
        var name;
        await invitationCards[i]
          .findElement(
            By.xpath(".//a[@class='invitation-card__link ember-view']")
          )
          .getAttribute("href")
          .then((url) => {
            href = url;
          });

        await invitationCards[i]
          .findElement(
            By.xpath(
              ".//span[@class='invitation-card__title t-16 t-black t-bold']"
            )
          )
          .getText()
          .then((text) => {
            name = text;
          });

        const connObject = { name: name, href: href };
        await withdrawalsSummary.push(connObject);
        await confirmWithdrawal(driver, name);
      }

      // await driver.wait(until.stalenessOf(overlayLayer));
    }
  } catch (e) {
    console.log(e);
  }
}

// Confirm individual contact withdrawal
async function confirmWithdrawal(driver, name) {
  try {
    const htmlName = name.replace(`'`, `&#39;`);
    const withdrawButton = await driver.findElement(
      By.xpath(
        `.//button[@aria-label='Withdraw invitation sent to ${htmlName}']`
      )
    );

    await withdrawButton.click();
    await driver.wait(
      until.elementIsVisible(
        driver.findElement(
          By.xpath("//*[text()[contains(.,'Withdraw invitation')]]")
        )
      )
    );

    let finalWithdrawButton = await driver.findElement(
      By.xpath(
        ".//button[@class='artdeco-modal__confirm-dialog-btn artdeco-button artdeco-button--2 artdeco-button--primary ember-view']"
      )
    );

    // let finalWithdrawButton = await driver.findElement(
    //   By.xpath("//span[text()[contains(.,'Cancel')]]")
    // );

    var overlayLayer = driver.findElement(
      By.xpath(
        "//*[@class='artdeco-modal-overlay artdeco-modal-overlay--layer-confirmation artdeco-modal-overlay--is-top-layer  ember-view']"
      )
    );

    // confirm withdrawal
    await finalWithdrawButton.click();

    await driver.wait(until.stalenessOf(overlayLayer));
  } catch (e) {
    console.log(e);
  }
}

module.exports = withdrawRequests;
