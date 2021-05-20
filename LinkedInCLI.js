const LinkedInFirefox = require("./LinkedInFirefox");

let properties = [
  { ask: "Enter URL: ", name: "URL", value: "" },
  {
    ask: "Enter the number of connection requests: ",
    name: "numOfConnections",
    value: null, //TODO cast to integer
  },
];

// print process.argv
process.argv.forEach((val, index) => {
  //console.log(`${index}: ${val}`);
  if (val.includes("URL=")) {
    properties[0].value = val.substr(6);
  } else if (val.includes("numOfConnections=")) {
    properties[1].value = parseInt(val.substr("numOfConnections=".length + 2));
  }
});

try {
  LinkedInFirefox(properties[0].value, properties[1].value);
  console.log(properties[0].value, properties[1].value);
} catch (e) {
  return onErr("Error in LinkedInFirefox: ", e);
}

function onErr(err) {
  console.log(err);
  return 1;
}
