const samuraiList = require("./scrapeParameters.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;
const updateDbWithScrape = utilities.updateDbWithScrape;

const assignLineTask = async (event) => {
  let msg = event.message.text;
  const token = event.replyToken;
  //TODO: なるべくswitch文のまま、正規表現に書き換え
  console.log("before msg: ", msg);
  msg = msg
    .split("")
    .map((e) => {
      return e.match(/[A-Z]/) ? e.toLowerCase() : e;
    })
    .join("");
  console.log("after msg: ", msg);
  switch (msg) {
    case "set":
      await updateDbWithScrape(samuraiList);
      replyToLine.send(token, "complete: set");
      break;
    case "recent":
      replyToLine.recentStats(token);
      break;
    case "total":
      replyToLine.totalStats(token);
      break;
    default:
      replyToLine.noKeyword(token);
  }
};

const assignUptimeRobotTask = async () => {
  await updateDbWithScrape(samuraiList);
};

exports.assignLineTask = assignLineTask;
exports.assignUptimeRobotTask = assignUptimeRobotTask;
