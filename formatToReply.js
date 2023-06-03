const formatToReplyRecent = (scrapedData) => {
  // TODO: updateDateと日付を比較し、「最近の試合なら」「今現在試合中の可能性があるなら」などで分岐（変数を設置して、文の中で分岐するのが良さそう）
  let nowOrNot = false;
  let now = new Date();
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
  returnText = `${scrapedData.playerName}:メジャー通算成績\n${scrapedData.totalStats.fullText.join(" ")}`;
};

exports.formatToReplyRecent = formatToReplyRecent;
exports.formatToReplyTotal = formatToReplyTotal;
