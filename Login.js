require("dotenv").config();
const get2FAToken = require("./2FA");
const { getElement, getElements, IsDisplayed } = require("./Utils");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

async function Login(driver) {
  try {
    const signInButton = await getElements(
      driver,
      `.//a[text()[contains(.,'Sign in')]]`
    );

    if (!(await IsDisplayed(signInButton))) {
      return;
    }
    await signInButton[0].click();

    const userName = await getElement(driver, `.//input[@id="username"]`);
    await userName.sendKeys(EMAIL);

    const pwd = await getElement(driver, `.//input[@id="password"]`);
    await pwd.sendKeys(PASSWORD);

    const signInSndButton = await getElement(
      driver,
      `.//button[text()[contains(.,'Sign in')]]`
    );
    await signInSndButton.click();

    const codeField = await getElement(
      driver,
      `.//form[@id='two-step-challenge']//input[@id='input__phone_verification_pin']`
    );
    await codeField.sendKeys(get2FAToken());

    const submit = await getElement(
      driver,
      `.//button[text()[contains(.,'Submit')]]`
    );
    await submit.click();
  } catch (e) {
    throw new Error(`ERROR: Login: ${e}`);
  }
}

module.exports = Login;
