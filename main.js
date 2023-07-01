const samuraiList = require("./scrapeParameters.js");
const utilities = require("./utilitieFunctions.js");
const replyToLine = utilities.replyToLine;
const updateDbWithScrape = utilities.updateDbWithScrape;

const assignLineTask = async (event) => {
  const msg = event.message.text;
  const token = event.replyToken;
  console.log("check: sended message: ", msg);
  switch (true) {
    case msg === process.env.KEYWORD_SET:
      await updateDbWithScrape(samuraiList);
      replyToLine.send(token, "complete: set");
      break;
    case /[\n.]*[Rr][Ee][Cc][Ee][Nn][Tt][\n.]*/.test(msg) || msg.includes("最新"):
      replyToLine.recentStats(token);
      break;
    case /[\n.]*[Tt][Oo][Tt][Aa][Ll][\n.]*/.test(msg) ||
      /[\n.]*[Ss][Ee][Aa][Ss][Oo][Nn][\n.]*/.test(msg) ||
      msg.includes("通算") ||
      msg.includes("シーズン"):
      replyToLine.totalStats(token);
      break;
    case /[\n.]*[Hh][Oo][Ww][Tt][Oo]*/.test(msg) || msg.includes("使い方"):
      //TODO: 「以下のキーワードを・・・」が散乱してるので、main.jsかreplyToLineでまとめる。新しくHowToをつくるか、noKeywordと合わせてsendにまとめるか考える。
      replyToLine.send(
        token,
        `以下のキーワードを送ってください。\n＜最新成績＞\n最新 / recent\n＜シーズン成績＞\n通算 / シーズン / total / season\n\n※シーズン成績は更新に時間がかかるため、試合前の情報が表示されることがあります。`
      );
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
