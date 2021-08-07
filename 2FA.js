require("dotenv").config();
const otplib = require("otplib");
const authenticator = otplib.authenticator;
const secret = process.env.SECRET_KEY;

function get2FAToken() {
  const token = authenticator.generate(secret);

  try {
    const isValid = authenticator.check(token, secret);
    if (isValid) {
      return token;
    }
  } catch (err) {
    // Possible errors
    // - options validation
    // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
    throw new Error(`ERROR: get2FAToken: ${err}`);
  }
}

module.exports = get2FAToken;
