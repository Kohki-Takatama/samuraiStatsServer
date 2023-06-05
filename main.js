const samuraiList = require("./scrapeParameters.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;
const updateDbWithScrape = utilities.updateDbWithScrape;

const receiveAndPassData = (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  if (msg.includes("set")) {
    updateDbWithScrape(token, samuraiList);
  } else if (msg.includes("recent")) {
    replyToLine.recentStats(token);
  } else if (msg.includes("total")) {
    replyToLine.totalStats(token);
  } else {
    replyToLine.noKeyword(token);
  }
};

module.exports = receiveAndPassData;
