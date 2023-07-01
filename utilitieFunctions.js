const sqlite3 = require("sqlite3").verbose();
const line = require("@line/bot-sdk");
const LINECONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};
const client = new line.Client(LINECONFIG);
const scrapeAndSaveToDb = require("./scrape.js");

const formatToReply = {
  recentStats: (scrapedData) => {
    // NOTE: updateDateと日付を比較し、「最近の試合なら」「今現在試合中の可能性があるなら」などで分岐
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
      returnText = `${scrapedData.playerName}\n最新:${scrapedData.recentStats.日付}\n成績は「${
        scrapedData.recentStats.打席結果
      }」で${nowOrNot ? "す" : "した"}。\n詳細な成績→ 打点:${
        scrapedData.recentStats.打点
      }\nシーズン成績→ 打率:${scrapedData.totalStats.打率} 出塁率:${scrapedData.totalStats.出塁率} OPS:${
        scrapedData.totalStats.OPS
      } 本塁打:${scrapedData.totalStats.本塁打}`;
    } else {
      returnText = `${scrapedData.playerName}\n最新:${scrapedData.recentStats.日付}\n${
        scrapedData.recentStats.投球回
      }回を投げ、失点${scrapedData.recentStats.失点}、自責点${scrapedData.recentStats.自責点}\n${
        scrapedData.recentStats.結果 === "-"
          ? "勝/敗はついていません。"
          : scrapedData.recentStats.結果 + "投手となっています。"
      }\n詳細な成績→ 被安打:${scrapedData.recentStats.被安打} 被本塁打:${
        scrapedData.recentStats.被本塁打
      } 奪三振:${scrapedData.recentStats.奪三振} 与四死球:${
        Number(scrapedData.recentStats.与四球) + Number(scrapedData.recentStats.与死球)
      } 暴投・ボーク:${
        Number(scrapedData.recentStats.暴投) + Number(scrapedData.recentStats.ボーク)
      }\nシーズン成績→ ${scrapedData.totalStats.勝利}勝${scrapedData.totalStats.敗戦}敗 防御率:${
        scrapedData.totalStats.防御率
      }`;
    }
    return returnText;
  },
  totalStats: (scrapedData) => {
    let returnText = "";
    const fullText = scrapedData.totalStats.fullText;
    returnText = `${scrapedData.playerName}:シーズン通算成績\n${fullText.join(" ")}`;
    return returnText;
  },
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

const replyToLine = {
  send: (token, msg) => {
    client
      .replyMessage(token, { type: "text", text: msg })
      .then("complete: replyToLine")
      .catch((err) => {
        console.error(`err: run: replyToken`, err);
      });
  },
  recentStats: async (token) => {
    let msg = await fetchAllFromDbWithQuery(
      "SELECT date, name, scrapedData FROM scrapedDb ORDER BY date ASC"
    );
    msg = msg.map((e) => (e = formatToReply.recentStats(e.scrapedData))).join("\n\n");
    replyToLine.send(token, msg);
  },
  totalStats: async (token) => {
    let msg = await fetchAllFromDbWithQuery(
      "SELECT date, name, scrapedData FROM scrapedDb ORDER BY name ASC"
    );
    msg = msg.map((e) => (e = formatToReply.totalStats(e.scrapedData))).join("\n\n");
    replyToLine.send(token, msg);
  },
  howTo: (token) => {
    replyToLine.send(token, ``);
  },
  noKeyword: (token) => {
    replyToLine.send(token, "please send only keyword");
  },
};

const updateDbWithScrape = async (scrapeParameters) => {
  for (let i in scrapeParameters) {
    await scrapeAndSaveToDb(scrapeParameters[i]);
  }
  console.log(`complete: updateDbWithScrapeData`);
};

exports.replyToLine = replyToLine;
exports.updateDbWithScrape = updateDbWithScrape;
