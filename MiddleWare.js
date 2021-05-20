var childprocess = require("child_process");

var app = Application.currentApplication();
app.includeStandardAdditions = true;

var URL = app.displayDialog("Enter URL: ", {
  defaultAnswer: "",
  withIcon: "note",
  buttons: ["Cancel", "Continue"],
  defaultButton: "Continue",
});

var numOfConnections = app.displayDialog("Enter # of Connections: ", {
  defaultAnswer: "",
  withIcon: "note",
  buttons: ["Cancel", "Continue"],
  defaultButton: "Continue",
});

var cd = childprocess.spawn("cd", [
  "/Users/naser/Desktop/Projects/LinkedInAutomation",
]);
var automatorPrompt = childprocess.spawn("/usr/local/bin/node", ["Main"]);
automatorPrompt.stdout.setEncoding("utf8");

automatorPrompt.stdout.on("data", function (data) {
  if (data.toString().includes("URL")) {
    automatorPrompt.stdin.write(URL + "\n");
  }
});

automatorPrompt.stdout.on("data", function (data) {
  automatorPrompt.stdin.write(numOfConnections + "\n");
});

app.displayDialog(`Getting you a noice ${numOfConnections} new connections...`);
