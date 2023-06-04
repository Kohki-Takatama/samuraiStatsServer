const convertToDate = (str) => {
  let [month, day] = str.replace("月", " ").replace("日", "").split(" ").map(Number);
  let date = new Date();
  date.setFullYear(date.getFullYear()); // 現在の年をセット
  date.setMonth(month - 1); // JavaScriptのDateは0から始まるので1を引く
  date.setDate(day);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dateOnly;
};

exports.convertToDate = convertToDate;
