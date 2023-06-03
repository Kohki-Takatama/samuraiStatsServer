const line = require("@line/bot-sdk");
const sqlite3 = require("sqlite3").verbose();

const samuraiList = require("./dbForScrape.js");
const scrapeToSqlite = require("./scrape.js");
const formatToReply = require("./formatToReply.js");
const formatToReplyRecent = formatToReply.formatToReplyRecent;
const formatToReplyTotal = formatToReply.formatToReplyTotal;

const CONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

const client = new line.Client(CONFIG);

const replyToLine = async (token, messageType) => {
  const db = new sqlite3.Database("./scrapedDb.db");
  db.serialize(() => {
    db.all("SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC", (err, rows) => {
      rows.map((e) => (e.scrapedData = JSON.parse(e.scrapedData)));
      let msg = [];
      for (let i in rows) {
        if (messageType === "recent") {
          msg.push(formatToReplyRecent(rows[i].scrapedData));
        } else if (messageType === "total") {
          msg.push(formatToReplyTotal(rows[i].scrapedData));
        } else {
          console.error(`err: run: replyToLine: messageType don't match`);
        }
      }
      msg = msg.join("\n\n");
      // console.log(`run: replyToLine, check db:`, row.date, row.name);
      client
        .replyMessage(token, { type: "text", text: msg })
        .then("complete: replyToLine")
        .catch((err) => {
          console.error(`err: run: replyToken`, err);
        });
    });
  });
  db.close();
};
const scrapeCycle = async (token) => {
  for (let i in samuraiList) {
    console.log(`run: scrapeCycle, doing: scrape: ${samuraiList[i].name}`);
    await scrapeToSqlite(samuraiList[i].url, samuraiList[i].selector);
  }
  console.log(`complete: scrapeCycle`);
  client.replyMessage(token, { type: "text", text: "complete: set" });
};

const receiveAndPassData = (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  if (msg.includes("set")) {
    console.log("run: scrapeCycle");
    scrapeCycle(token);
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
