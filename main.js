const samuraiList = require("./scrapeParameters.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;
const updateDbWithScrape = utilities.updateDbWithScrape;

const assignLineTask = async (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  console.log("check: sended message: ", msg);
  switch (true) {
    case /[\n.]*[Ss][Ee][Tt][\n.]*/.test(msg):
      await updateDbWithScrape(samuraiList);
      replyToLine.send(token, "complete: set");
      break;
    case /[\n.]*[Rr][Ee][Ce][Ee][Nn][Tt][\n.]*/.test(msg):
      replyToLine.recentStats(token);
      break;
    case /[\n.]*[Tt][Oo][Tt][Aa][Ll][\n.]*/.test(msg):
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
