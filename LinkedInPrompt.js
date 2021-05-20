const LinkedInFirefox = require("./LinkedInFirefox");
const prompt = require("prompt");

const properties = [
  { ask: "Enter URL: ", name: "URL" },
  {
    ask: "Enter the number of connection requests: ",
    name: "numOfConnections",
    type: "number",
  },
];
prompt.start();

prompt.get(properties, function (err, result) {
  if (err) {
    return onErr(err);
  }
  console.log(
    `Getting you a noice ${result.numOfConnections} new connections...`
  );
  try {
    LinkedInFirefox(result.URL, result.numOfConnections);
  } catch (e) {
    return onErr(e);
  }
});

function onErr(err) {
  console.log(err);
  return 1;
}
