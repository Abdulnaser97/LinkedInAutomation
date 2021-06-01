var webdriver = require("selenium-webdriver");
require("geckodriver");
var firefox = require("selenium-webdriver/firefox");
const { getPastRequests } = require("./connectionsLog");
const withdrawRequests = require("./WithdrawRequests");

var until = webdriver.until;
var By = webdriver.By;
var Key = webdriver.Key;
var element = webdriver.WebElement;
let pastRequests;

async function LinkedInFirefox(URL, numOfConnections) {
  var options = new firefox.Options();
  options.setProfile(
    "/Users/naser/Library/Application Support/Firefox/Profiles/43nh5j2m.default-release-1"
  );
  var builder = new webdriver.Builder().forBrowser("firefox");
  builder.setFirefoxOptions(options);
  driver = builder.build();

  driver.wait(until.titleContains("LinkedIn"));

  await withdrawRequests(driver);
  await sendConnectionRequests(driver, URL, numOfConnections);
  await driver.get(
    "https://www.linkedin.com/mynetwork/invitation-manager/sent/"
  );
}

async function sendConnectionRequests(driver, URL, numOfConnections) {
  // Get past connection requests from the xls file
  pastRequests = await getPastRequests();

  // Loop through the next the 30 pages from the provided URL until mumOfConnections is satisfied
  const pageCount = 30;
  let totalConnected = 0;
  for (let i = 1; i < pageCount + 1; i++) {
    if (totalConnected >= numOfConnections) {
      break;
    }

    let pageURL = i === 1 ? URL : URL + `&page=${i}`;

    await driver.get(pageURL);

    await driver.wait(function () {
      return driver
        .executeScript("return document.readyState")
        .then(function (readyState) {
          return readyState === "complete";
        });
    });

    // Wait for any of the 3 buttons (i.e. wait for the page to fully load). Regular page load here won't work due to LinkedIn's async API calls post page load
    await Promise.race([
      driver.wait(
        until.elementsLocated(
          By.xpath("//span[text()[contains(.,'Connect')]]")
        ),
        5000
      ),
      driver.wait(
        until.elementsLocated(
          By.xpath("//span[text()[contains(.,'Message')]]")
        ),
        5000
      ),
      driver.wait(
        until.elementsLocated(
          By.xpath("//span[text()[contains(.,'Pending')]]")
        ),
        5000
      ),
    ]).then(async () => {
      totalConnected += await connect(driver, totalConnected, numOfConnections);
    });
  }

  console.log("Total New Connections = ", totalConnected);
  await driver.get(
    "https://www.linkedin.com/mynetwork/invitation-manager/sent/"
  );
}

//Connect with all on each page
async function connect(driver, totalConnected, numOfConnections) {
  let searchResults = await driver.findElements(
    By.xpath(".//li[@class='reusable-search__result-container ']")
  );

  let totalConnectedPerPage = 0;
  for (let i = 0; i < searchResults.length; i++) {
    if (totalConnected >= numOfConnections) {
      break;
    }

    let currentConnInfo = await searchResults[i].getText();
    let hasAlreadyBeenSentARequest = await pastRequests.some(
      (pastConnection) => {
        const pastConnName = pastConnection.A;
        if (currentConnInfo.includes(pastConnName)) {
          return true;
        }
      }
    );

    if (!hasAlreadyBeenSentARequest) {
      const connectButton = await searchResults[i].findElement(
        By.xpath(`.//span[text()[contains(.,'Connect')]]`)
      );

      await connectButton.click();

      await driver.wait(
        until.elementIsVisible(
          driver.findElement(By.xpath("//*[@id='send-invite-modal']"))
        )
      );

      // CancelButton For testing "//button[@aria-label='Dismiss']//li-icon[@type='cancel-icon']"
      let sendButtons = await driver.findElements(
        By.xpath("//span[text()[contains(.,'Send')]]")
      );

      var overlayLayer = driver.findElement(
        By.xpath(
          "//*[@class='artdeco-modal-overlay artdeco-modal-overlay--layer-default artdeco-modal-overlay--is-top-layer  ember-view']"
        )
      );
      // Send the LinkedIn Connection Request
      await sendButtons[0].click();

      await driver.wait(until.stalenessOf(overlayLayer));

      totalConnectedPerPage += 1;
      totalConnected += 1;
    }
  }
  return totalConnectedPerPage;
}

module.exports = LinkedInFirefox;
