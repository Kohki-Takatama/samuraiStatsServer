const line = require("@line/bot-sdk");
const sqlite3 = require("sqlite3").verbose();

const samuraiList = require("./dbForScrape.js");
const scrapeToSqlite = require("./scrape.js");
const formatToReply = require("./formatToReply.js");
// const convertToDate = require("./convertToDate.js");

const CONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

const client = new line.Client(CONFIG);

// const scrapeAndFormat = async (url, cssSelector) => {
//   const scrapedData = await scrapeToSqlite(url, cssSelector);
//   const formatedData = formatToReply(scrapedData);
//   return formatedData;
// };


const replyToLine = async (token) => {
  //   let replyMessage = "";
  //   if (message.includes("最新")) {
  //     let sortArray = [];
  //     for (let i in samuraiList) {
  //       sortArray.push(
  //         await scrapeToSqlite(samuraiList[i].url, samuraiList[i].selector)
  //       );
  //     }

  //     sortArray.sort(
  //       (a, b) =>
  //         convertToDate(a.recentStats.日付) - convertToDate(b.recentStats.日付)
  //     );
  //     for (let i in sortArray) {
  //       const formatedData = formatToReply(sortArray[i]);
  //       console.log(i);
  //       console.log(formatedData)
  //       client.replyMessage(token, { type: "text", text: formatedData });
  //     }
  //   } else {
  //     client.replyMessage(token, { type: "text", text: "don't match any case" });
  //   }
  //await scrapeToSqlite(samuraiList[0].url, samuraiList[0].selector);

  const db = new sqlite3.Database("./scrapedDb.db");
  db.serialize(() => {
    db.each(
      "SELECT date, name, scrapedData FROM scrapedDb",
       (err, row) =>{
        let scrapedDataArray = JSON.parse(row.scrapedData);
         console.log(scrapedDataArray)
        console.log(`replyToLine: db:`, row.date, row.name);
         for(let i in scrapedDataArray) {
            client.replyMessage(token, { type: "text", text: formatToReply(scrapedDataArray[i]) })
         }
      }
    );
  });
  db.close();
};
const scrapeCycle = async () => {
  for (let i in samuraiList) {
    console.log(`scrape: ${samuraiList[i].name}`)
    await scrapeToSqlite(samuraiList[i].url, samuraiList[i].selector);
    console.log(`scrape complete`)
  }

  const db = new sqlite3.Database("./scrapedDb.db");
  db.serialize(() => {
    db.each(
      "SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC",
      function (err, row) {
        let scrapedDataArray = JSON.parse(row.scrapedData);
        console.log(`scrapeCycle: db:`, row.date, row.name);
      }
    );
  });
  db.close();
};

const receiveAndPassData = (event) => {
  const msg = event.message.text
  const token = event.replyToken
  if(msg.includes("set")) {
    console.log("set data")
    scrapeCycle();
  } else if (msg.includes("recent")) {
    console.log(`reply recent`)
    replyToLine(token)
  }
}

module.exports = receiveAndPassData;
