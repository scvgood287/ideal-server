const { Game, Image, PlayCountLog, ImageRateLog } = require("models/ideals");

const getRounds = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { gameId },
  } = ctx;

  try {
    const gameDoc = await Game.findById(gameId, {}, (err, doc) => {
      if (err) return ctx.throw(500, err);
      if (!doc)
        return ctx.throw(404, "Not Found", {
          errors: [
            {
              message: "Game Not Found",
              gameId,
            },
          ],
        });
    });
    const imagesCount = gameDoc.imagesCount;

    const data = imagesCount;
    const links = {
      getImages: {
        rel: "images",
        method: "get",
        href: `/images/${gameId}`,
        more: ["round"],
      },
    };

    ctx.status = 200;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const getRates = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { gameId, top: topParam },
  } = ctx;

  try {
    const top = Number(topParam);

    if (isNaN(top)) {
      return ctx.throw(400, "Bad Request", {
        errors: [
          {
            message: "top's type is Not Number",
          },
        ],
      });
    }

    const images = await Image.find({ gameId }, (err, doc) => {
      if (err) return ctx.throw(500, err);
      if (!doc)
        return ctx.throw(404, "Not Found", {
          errors: [
            {
              message: "Images Not Found",
              gameId,
            },
          ],
        });
    })
      .sort({ firstRate: -1, winRate: -1, entry: 1, lose: 1 })
      .limit(top);

    const data = images;
    const links = {
      // getSomething
    };

    ctx.status = 200;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const postLogs = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    request: { body },
    params: { gameId },
  } = ctx;

  try {
    const newPlayCountLog = await PlayCountLog.insertMany({ gameId });
    const newImageRateLog = await ImageRateLog.insertMany(body);

    const data = {
      newPlayCountLog,
      newImageRateLog,
    };
    const links = {};

    ctx.status = 201;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

module.exports = {
  getRounds,
  getRates,
  postLogs,
};
