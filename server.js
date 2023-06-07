const fastify = require("fastify")({ logger: false });
const line = require("@line/bot-sdk");

const assignLineTask = require("./main.js");

const LINECONFIG = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY,
};

// application/jsonのリクエストボディを文字列として扱うように設定します
fastify.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  done(null, body);
});

/// /webhook へのPOSTリクエストを処理します
fastify.post("/webhook", async (request, reply) => {
  // リクエストがLINEから来たものか確認します
  const rawBody = request.body; // 文字列としてのリクエストボディ
  const signature = request.headers["x-line-signature"]; // LINEからの署名
  if (!line.validateSignature(rawBody, LINECONFIG.channelSecret, signature)) {
    reply.code(403).send("Unauthorized"); // 署名が一致しない場合、403エラーを返します
    return;
  }

  const parsedBody = JSON.parse(rawBody); // リクエストボディをJavaScriptオブジェクトに変換します
  // 各イベントを処理します
  parsedBody.events.map((event) => {
    assignLineTask(event);
  });
  reply.code(200).send("OK"); // 200 OKを返します
});

// 新しいエンドポイントを作成してUptimeRobotからのリクエストを受け付けます
fastify.head("/uptimerobot", async (request, reply) => {
  assignLineTask();
  reply.code(200).send("OK");
});

// サーバーを起動します
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});
