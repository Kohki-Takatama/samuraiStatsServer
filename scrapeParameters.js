//TODO:リファクタリング：Selector項目の一元管理（全てのファイルで共通して、できれば一か所で管理）

const commonCSSSelector = {
  playerName:
    "#contentMain > div.bb-centerColumn > div.bb-modCommon01 > div > div > div.bb-profile__data > ruby > h1",
  updateDate: ".bb-tableNote__update",
  recentTeamStatsUrl:
    "#game_p > tbody > tr:nth-child(1) > td.bb-playerStatsTable__data.bb-playerStatsTable__data--date > a",
};
const nonFielderOtaniCommonCSSSelector = {
  totalStatsHeader: "#js-tabDom01 > section:nth-child(1) > table > tbody > tr > th",
  totalStatsData: "#js-tabDom01 > section:nth-child(1) > table > tbody > tr > td",
};

const fielderCSSSelector = {
  ...commonCSSSelector,
  ...nonFielderOtaniCommonCSSSelector,
  recentStatsHeader: "#game_b > thead > tr > th",
  recentStatsData: "#game_b > tbody > tr:nth-child(1) > td",
};
const pitcherCSSSelector = {
  ...commonCSSSelector,
  ...nonFielderOtaniCommonCSSSelector,
  recentStatsHeader: "#game_p > thead > tr > th",
  recentStatsData: "#game_p > tbody > tr:nth-child(1) > td",
};
const fielderOtaniCSSSelector = {
  ...commonCSSSelector,
  totalStatsHeader: "#js-tabDom01 > section:nth-child(2) > table > tbody > tr > th",
  totalStatsData: "#js-tabDom01 > section:nth-child(2) > table > tbody > tr > td",
  recentStatsHeader: "#game_b > thead > tr > th",
  recentStatsData: "#game_b > tbody > tr:nth-child(1) > td",
};

const samuraiList = [
  {
    name: "吉田 正尚",
    symbol: "💪",
    url: "https://baseball.yahoo.co.jp/mlb/player/202100515/top",
    selector: fielderCSSSelector,
  },
  {
    name: "大谷 翔平",
    symbol: "👼",
    url: "https://baseball.yahoo.co.jp/mlb/player/2100825/top",
    selector: fielderOtaniCSSSelector,
  },
  {
    name: "大谷 翔平",
    symbol: "👼",
    url: "https://baseball.yahoo.co.jp/mlb/player/2100825/top",
    selector: pitcherCSSSelector,
  },
  {
    name: "菊池 雄星",
    symbol: "👅",
    url: "https://baseball.yahoo.co.jp/mlb/player/2100956/top",
    selector: pitcherCSSSelector,
  },
  {
    name: "前田 健太",
    symbol: "🎏",
    url: "https://baseball.yahoo.co.jp/mlb/player/2100533/top",
    selector: pitcherCSSSelector,
  },
  {
    name: "藤浪 晋太郎",
    symbol: "☄",
    url: "https://baseball.yahoo.co.jp/mlb/player/202100513/top",
    selector: pitcherCSSSelector,
  },
  {
    name: "千賀 滉大",
    symbol: "👻",
    url: "https://baseball.yahoo.co.jp/mlb/player/202100525/top",
    selector: pitcherCSSSelector,
  },
  {
    name: "鈴木 誠也",
    symbol: "🦍",
    url: "https://baseball.yahoo.co.jp/mlb/player/202100102/top",
    selector: fielderCSSSelector,
  },
  {
    name: "ラーズ・ヌートバー",
    symbol: "🇯🇵🇺🇸",
    url: "https://baseball.yahoo.co.jp/mlb/player/2102188/top",
    selector: fielderCSSSelector,
  },
  {
    name: "ダルビッシュ 有",
    symbol: "🎮",
    url: "https://baseball.yahoo.co.jp/mlb/player/2100954/top",
    selector: pitcherCSSSelector,
  },
];

module.exports = samuraiList;
