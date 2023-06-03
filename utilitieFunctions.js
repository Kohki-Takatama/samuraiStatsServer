  const sqlite3 = require("sqlite3").verbose();
  const db = new sqlite3.Database("./scrapedDb.db");
db.run("DROP TABLE IF EXISTS scrapedDb")