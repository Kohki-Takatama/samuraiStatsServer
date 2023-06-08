const samuraiList = require("./scrapeParameters.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;
const updateDbWithScrape = utilities.updateDbWithScrape;

const assignLineTask = async (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  //TODO: なるべくswitch文のまま、正規表現に書き換え
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
