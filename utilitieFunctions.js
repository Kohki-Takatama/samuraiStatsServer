const sqlite3 = require("sqlite3").verbose();
const line = require("@line/bot-sdk");

const CONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

const client = new line.Client(CONFIG);

const formatToReplyRecent = (scrapedData) => {
  // TODO: updateDateと日付を比較し、「最近の試合なら」「今現在試合中の可能性があるなら」などで分岐（変数を設置して、文の中で分岐するのが良さそう）
  let nowOrNot = false;
  let now = new Date();
  now.setTime(now.getTime() + 1000 * 60 * 60 * 9);
  now = now.getMonth() + 1 + "月" + now.getDate() + "日";
  if (scrapedData.recentStats.日付 === now) {
    nowOrNot = true;
  }

  let returnText = "";

  //NOTE: 打者か投手かの判別。
  if ("打席結果" in scrapedData.recentStats) {
    returnText = `${scrapedData.playerName}は${scrapedData.recentStats.日付}の試合に出場${
      nowOrNot ? "しています" : "しました"
    }。\n成績は「${scrapedData.recentStats.打席結果}」で${nowOrNot ? "す" : "した"}。\n詳細な成績→ 打点:${
      scrapedData.recentStats.打点
    }`;
  } else {
    returnText = `${scrapedData.playerName}は${scrapedData.recentStats.日付}の試合に登板${
      nowOrNot ? "しています" : "しました"
    }。\n${scrapedData.recentStats.投球回}回を投げ、失点は${scrapedData.recentStats.失点}、自責点は${
      scrapedData.recentStats.自責点
    } で${nowOrNot ? "す" : "した"}。\n詳細な成績→ 被安打:${scrapedData.recentStats.被安打} 被本塁打:${
      scrapedData.recentStats.被本塁打
    } 奪三振:${scrapedData.recentStats.奪三振} 与四死球:${
      Number(scrapedData.recentStats.与四球) + Number(scrapedData.recentStats.与死球)
    }`;
  }
  return returnText;
};

const formatToReplyTotal = (scrapedData) => {
  let returnText = "";
  const fullText = scrapedData.totalStats.fullText;
  returnText = `${scrapedData.playerName}:シーズン通算成績\n${fullText.join(" ")}`;
  return returnText;
};

const fetchAllFromDbWithQuery = (query) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./scrapedDb.db");
    db.serialize(() => {
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          rows.forEach((e) => {
            if (e.scrapedData) {
              e.scrapedData = JSON.parse(e.scrapedData);
            }
          });
          resolve(rows);
        }
      });
    });
    db.close();
  });
};

const replyToLine = async (token, messageType) => {
  let msg = "";

  switch (messageType) {
    case "recent":
      msg = await fetchAllFromDbWithQuery("SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC");
      msg.map((e) => (e = formatToReplyRecent(e.scrapedData))).join("\n\n");
      break;
    case "total":
      msg = await fetchAllFromDbWithQuery("SELECT date, name, scrapedData FROM scrapedDb ORDER BY name ASC");
      msg.map((e) => (e = formatToReplyRecent(e.scrapedData))).join("\n\n");
      break;
    case "error":
      msg = "your message don't include keyword";
      break;
    default:
      console.error(`err: run: replyToLine: messageType don't match`);
  }
  client
    .replyMessage(token, { type: "text", text: msg })
    .then("complete: replyToLine")
    .catch((err) => {
      console.error(`err: run: replyToken`, err);
    });
  // db.serialize(() => {
  //   db.all("SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC", (err, rows) => {
  //     rows.map((e) => (e.scrapedData = JSON.parse(e.scrapedData)));
  //     let msg = [];
  //     for (let i in rows) {
  //       if (messageType === "recent") {
  //         msg.push(formatToReplyRecent(rows[i].scrapedData));
  //       } else if (messageType === "total") {
  //         msg.push(formatToReplyTotal(rows[i].scrapedData));
  //       } else if (messageType === "error") {
  //         msg = "your message don't include keyword";
  //         break;
  //       } else {
  //         console.error(`err: run: replyToLine: messageType don't match`);
  //       }
  //     }
  //     msg = msg.join("\n\n");
  //     // console.log(`run: replyToLine, check db:`, row.date, row.name);
  //     client
  //       .replyMessage(token, { type: "text", text: msg })
  //       .then("complete: replyToLine")
  //       .catch((err) => {
  //         console.error(`err: run: replyToken`, err);
  //       });
  //   });
  // });
  // db.close();
};

exports.formatToReplyRecent = formatToReplyRecent;
exports.formatToReplyTotal = formatToReplyTotal;
exports.replyToLine = replyToLine;
