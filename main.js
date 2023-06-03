const line = require("@line/bot-sdk");
const sqlite3 = require("sqlite3").verbose();

const samuraiList = require("./dbForScrape.js");
const scrapeToSqlite = require("./scrape.js");
const formatToReply = require("./formatToReply.js");

const CONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

const client = new line.Client(CONFIG);

const replyToLine = async (token) => {
  const db = new sqlite3.Database("./scrapedDb.db");
  db.serialize(() => {
    db.all("SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC", (err, rows) => {
      rows.map((e) => (e.scrapedData = JSON.parse(e.scrapedData)));
      let msg = [];
      for (let i in rows) {
        msg.push(formatToReply(rows[i].scrapedData));
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
const scrapeCycle = async () => {
  for (let i in samuraiList) {
    console.log(`run: scrapeCycle, doing: scrape: ${samuraiList[i].name}`);
    await scrapeToSqlite(samuraiList[i].url, samuraiList[i].selector);
  }
  console.log(`complete: scrapeCycle`);
};

const receiveAndPassData = (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  if (msg.includes("set")) {
    console.log("run: scrapeCycle");
    scrapeCycle();
  } else if (msg.includes("recent")) {
    console.log(`run: replyToLine`);
    replyToLine(token);
  }
};

module.exports = receiveAndPassData;
