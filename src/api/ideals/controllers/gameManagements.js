const { Game, Image, PlayCountLog, ImageRateLog } = require("models/ideals");
const {
  s3: { deleteS3Game },
} = require("aws");

const postGames = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    request: { body },
  } = ctx;

  try {
    const newGame = await Game.insertMany(body);

    const data = newGame;
    const links = {
      getGames: {
        rel: "games",
        method: "get",
        href: "/games/0",
        more: [],
      },
      postGames: {
        rel: "create",
        method: "post",
        href: "/games",
        more: [],
        body: {
          name: {
            required: true,
            unique: true,
            type: "string",
            content: "Game's Name",
          },
          tagNames: {
            main: { required: true, type: "string", content: "mainTag's Name" },
            sub: { required: true, type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      editGames: {
        rel: "update",
        method: "patch",
        href: "/games",
        more: ["gameId"],
        body: {
          isPlayable: {
            type: "number",
            content: "unPlayable = 0 or Playable = 1",
          },
          updated: { required: true, type: "Date", content: "Date.now()" },
          tagNames: {
            main: { type: "string", content: "mainTag's Name" },
            sub: { type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      deleteGames: {
        rel: "delete",
        method: "delete",
        href: "/games",
        more: ["gameId"],
        body: {},
      },
      getImages: {
        rel: "images",
        method: "get",
        href: "/images",
        more: ["gameId", "round === 0"],
      },
    };

    ctx.status = 201;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const editGames = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    request: { body },
    params: { gameId },
  } = ctx;

  try {
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { $set: body },
      { new: true }
    );

    const data = updatedGame;
    const links = {
      getGames: {
        rel: "games",
        method: "get",
        href: "/games/0",
        more: [],
      },
      postGames: {
        rel: "create",
        method: "post",
        href: "/games",
        more: [],
        body: {
          name: {
            required: true,
            unique: true,
            type: "string",
            content: "Game's Name",
          },
          tagNames: {
            main: { required: true, type: "string", content: "mainTag's Name" },
            sub: { required: true, type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      editGames: {
        rel: "update",
        method: "patch",
        href: "/games",
        more: ["gameId"],
        body: {
          isPlayable: {
            type: "number",
            content: "unPlayable = 0 or Playable = 1",
          },
          updated: { required: true, type: "Date", content: "Date.now()" },
          tagNames: {
            main: { type: "string", content: "mainTag's Name" },
            sub: { type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      deleteGames: {
        rel: "delete",
        method: "delete",
        href: "/games",
        more: ["gameId"],
        body: {},
      },
      getImages: {
        rel: "images",
        method: "get",
        href: "/images",
        more: ["gameId", "round === 0"],
      },
    };

    ctx.status = 201;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const deleteGames = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { gameId },
  } = ctx;

  try {
    const deletedGame = await Game.findByIdAndDelete(gameId);
    const deletedImages = await Image.deleteMany({ gameId });
    const deletedPlayCountLog = await PlayCountLog.deleteMany({ gameId });
    const deletedImageRateLog = await ImageRateLog.deleteMany({ gameId });

    const data = {
      deletedGame,
      deletedImages,
      deletedPlayCountLog,
      deletedImageRateLog,
    };

    if (deletedGame.imagesCount > 0) {
      const deletedS3Images = await deleteS3Game(deletedGame.name);
      data.deletedS3Images = deletedS3Images;
    }
    const links = {
      getGames: {
        rel: "games",
        method: "get",
        href: "/games/0",
        more: [],
      },
      postGames: {
        rel: "create",
        method: "post",
        href: "/games",
        more: [],
        body: {
          name: {
            required: true,
            unique: true,
            type: "string",
            content: "Game's Name",
          },
          tagNames: {
            main: { required: true, type: "string", content: "mainTag's Name" },
            sub: { required: true, type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      editGames: {
        rel: "update",
        method: "patch",
        href: "/games",
        more: ["gameId"],
        body: {
          isPlayable: {
            type: "number",
            content: "unPlayable = 0 or Playable = 1",
          },
          updated: { required: true, type: "Date", content: "Date.now()" },
          tagNames: {
            main: { type: "string", content: "mainTag's Name" },
            sub: { type: "string", content: "subTag's Name" },
            optional: { type: "string", content: "optionalTag's Name" },
          },
        },
      },
      deleteGames: {
        rel: "delete",
        method: "delete",
        href: "/games",
        more: ["gameId"],
        body: {},
      },
      getImages: {
        rel: "images",
        method: "get",
        href: "/images",
        more: ["gameId", "round === 0"],
      },
    };

    ctx.status = 200;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

module.exports = {
  postGames,
  editGames,
  deleteGames,
};
