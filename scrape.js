const axios = require("axios");
const { load: loadByCheerio } = require("cheerio");

const returnHTML = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchHTMLText = async (html, selector) => {
  const $ = loadByCheerio(html);
  let returnArray = [];
  const elements = await $(selector);

  if (elements.length === 0) {
    throw new Error(`No elements found for selector: ${selector}\nURL: ${url}`);
  }

  elements.each((i, e) => {
    returnArray.push($(e).text().trim());
  });

  return returnArray;
};

const mergeArraysToString = (titleArray, dataArray) => {
  let returnArray = [];
  if (titleArray.length === dataArray.length) {
    for (let i = 0; i < titleArray.length; i++) {
      returnArray.push(titleArray[i] + "：" + dataArray[i]);
    }
    return returnArray;
  } else {
    throw new Error(
      `dataLength don't match at mergeArraysToString.\ntitleArray: ${titleArray} , dataArray.length: ${dataArray}\nURL: ${url}`
    );
  }
};

const mergeArraysToDictionary = (keyArray, dataArray) => {
  let returnArray = {};
  if (keyArray.length === dataArray.length) {
    for (let i = 0; i < keyArray.length; i++) {
      returnArray[keyArray[i]] = dataArray[i];
    }
    return returnArray;
  } else {
    throw new Error(
      `dataLength don't match at mergeArrayToDictionary.\nkeyArray: ${keyArray} , dataArray.length: ${dataArray}\nURL: ${url}`
    );
  }
};

const scrapeAndSaveToDb = async (parameter) => {
  const url = parameter.url;
  const selectors = parameter.selector;
  const name = parameter.name;
  console.log(`run: updateDbWithScrapeData, doing: scrape: ${name}`);

  const html = await returnHTML(url);
  let returnScrapeArray = {};
  try {
    //NOTE: 名前
    returnScrapeArray.playerName = await fetchHTMLText(html, selectors.playerName);
    //NOTE: 最新試合成績
    const recentStatsHeader = await fetchHTMLText(html, selectors.recentStatsHeader);
    const recentStatsData = await fetchHTMLText(html, selectors.recentStatsData);
    returnScrapeArray.recentStats = mergeArraysToDictionary(recentStatsHeader, recentStatsData);
    returnScrapeArray.recentStats.fullText = mergeArraysToString(recentStatsHeader, recentStatsData);
    //NOTE: 通算成績
    const totalStatsHeader = await fetchHTMLText(html, selectors.totalStatsHeader);
    const totalStatsData = await fetchHTMLText(html, selectors.totalStatsData);
    returnScrapeArray.totalStats = mergeArraysToDictionary(totalStatsHeader, totalStatsData);
    returnScrapeArray.totalStats.fullText = mergeArraysToString(totalStatsHeader, totalStatsData);
    //NOTE: 更新日時（複数ある場合がある。ページ上に表示されるのは[0]だったので[0]を選択）
    const updateDateArray = await fetchHTMLText(html, ".bb-tableNote__update");
    returnScrapeArray.updateDate = updateDateArray[0];
  } catch (error) {
    throw new Error(
      `${error}
      \nCurrent returnArray:
      \nplayerName: ${returnScrapeArray.playerName}
      \nrecentStats: ${returnScrapeArray.recentStats}
      \ntotalStats: ${returnScrapeArray.totalStats}
      \nupdateDate: ${returnScrapeArray.updateDate}`
    );
  }
  const sqlite3 = require("sqlite3").verbose();
  const db = new sqlite3.Database("./scrapedDb.db");

  await db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS scrapedDb (date DATE, name TEXT UNIQUE, scrapedData TEXT)");
    db.run(`DELETE FROM scrapedDb WHERE name IS NULL`);
    let statement = db.prepare("INSERT OR REPLACE INTO scrapedDb VALUES (?, ?, ?)");
    const now = new Date();
    let date = returnScrapeArray.recentStats.日付
      .replace("月", " ")
      .replace("日", "")
      .split(" ")
      .map((e) => e.padStart(2, "0"));
    date = now.getFullYear() + "-" + date.join("-");
    let name = returnScrapeArray.playerName[0];
    if (name === "大谷 翔平") {
      if (returnScrapeArray.recentStats.打点) {
        name = "大谷 翔平(打)";
      } else {
        name = "大谷 翔平(投)";
      }
    }
    statement.run(date, name, JSON.stringify(returnScrapeArray));
    statement.finalize();
  });

  db.close();
};

module.exports = scrapeAndSaveToDb;
