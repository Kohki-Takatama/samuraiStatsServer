const line = require("@line/bot-sdk");

const samuraiList = require("./scrapeParameters.js");
const scrapeAndSaveToDb = require("./scrape.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;

const CONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

const client = new line.Client(CONFIG);

const updateDbWithScrapeData = async (token) => {
  for (let i in samuraiList) {
    console.log(`run: updateDbWithScrapeData, doing: scrape: ${samuraiList[i].name}`);
    await scrapeAndSaveToDb(samuraiList[i].url, samuraiList[i].selector);
  }
  console.log(`complete: updateDbWithScrapeData`);
  client.replyMessage(token, { type: "text", text: "complete: set" });
};

const receiveAndPassData = (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  if (msg.includes("set")) {
    console.log("run: scrapeCycle");
    updateDbWithScrapeData(token);
  } else if (msg.includes("recent")) {
    console.log(`run: replyToLine("recent")`);
    replyToLine(token, "recent");
  } else if (msg.includes("total")) {
    console.log(`run: replyToLine("total")`);
    replyToLine(token, "total");
  } else {
    client
      .replyMessage(token, { type: "text", text: "your message don't include keyword" })
      .then("complete: replyToLine")
      .catch((err) => {
        console.error(`err: run: replyToken`, err);
      });
  }
};

module.exports = receiveAndPassData;
