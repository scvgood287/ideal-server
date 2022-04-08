const { Game, Image } = require("models/ideals");
const { getRandomArray } = require("utils");

const getGames = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { onlyPlayableGames: onlyPlayableGamesParam },
  } = ctx;

  try {
    const onlyPlayableGames = Number(onlyPlayableGamesParam);

    const filter = onlyPlayableGames ? { isPlayable: 1 } : {};
    const sortBy = onlyPlayableGames ? { playCount: -1 } : { updated: 1 };

    const games = await Game.find(filter, (err, games) => {
      if (err) return ctx.throw(500, err);
      if (!games)
        return ctx.throw(404, "Not Found", {
          errors: [
            {
              message: "Games Not Found",
              onlyPlayableGames,
            },
          ],
        });
    }).sort(sortBy);

    const data = games;
    const links = onlyPlayableGames
      ? {
          getRounds: {
            rel: "rounds",
            method: "get",
            href: "/rounds",
            more: ["gameId"],
          },
          getImages: {
            rel: "images",
            method: "get",
            href: "/images",
            more: ["gameId", "round"],
          },
        }
      : {
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
                main: {
                  required: true,
                  type: "string",
                  content: "mainTag's Name",
                },
                sub: {
                  required: true,
                  type: "string",
                  content: "subTag's Name",
                },
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

const getImages = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { gameId, round: roundParam },
  } = ctx;

  try {
    const round = roundParam === undefined ? 0 : Number(roundParam);
    if (isNaN(round)) {
      return ctx.throw(400, "Bad Request", {
        errors: [
          {
            message: "round's type is Not Number",
            gameId,
            round: roundParam,
          },
        ],
      });
    }

    let imageDocs = round
      ? await Image.find({ gameId })
      : await Image.find({ gameId }).sort({ name: 1 });
    const images = round ? getRandomArray(imageDocs, round) : imageDocs;

    if (!images) {
      return ctx.throw(400, "Bad Request", {
        errors: [
          {
            message: "round is more than imagesCount",
            imagesCount: images.length,
            round,
          },
        ],
      });
    }

    const data = images;
    const links = round
      ? {
          getRates: {
            rel: "rates",
            method: "get",
            href: `/rates/${gameId}`,
            more: ["top === 지금은 20"],
          },
          postLogs: {
            rel: "logs",
            method: "post",
            href: "/logs",
            more: ["gameId"],
            body: {
              imageId: {
                required: true,
                type: "ObjectId",
                content: "Image's Id",
              },
              gameId: {
                required: true,
                type: "ObjectId",
                content: "Played Game's Id",
              },
              first: {
                required: true,
                type: "number",
                min: 0,
                max: 1,
                content: "First in this game = 1 or 0",
              },
              entry: {
                required: true,
                type: "number",
                min: 0,
                max: 1,
                content: "Played Game = 1",
              },
              win: {
                required: true,
                type: "number",
                min: 0,
                content: "Total of Image's winCount",
              },
              lose: {
                required: true,
                type: "number",
                min: 0,
                max: 1,
                content: "first === 1 ? 0 : 1",
              },
            },
          },
        }
      : {
          postImages: {
            rel: "images",
            method: "post",
            href: `/images/${gameId}`,
            more: [],
            body: {
              gameId: {
                required: true,
                type: "ObjectId",
                content: "Target Game's Id",
              },
              imageUrl: {
                required: true,
                type: "string",
                content: "Image's Url",
              },
              name: {
                required: true,
                type: "string",
                unique: true,
                content: "mainTag_subTag_optionalTag",
              },
              tags: {
                main: {
                  required: true,
                  type: "string",
                  content: "mainTag's value",
                },
                sub: {
                  required: true,
                  type: "string",
                  content: "subTag's value",
                },
                optional: {
                  type: "string",
                  content:
                    "optionalTag's value, if Game's optinalTagName existed, this.require = true",
                },
              },
            },
          },
          editImages: {
            rel: "images",
            method: "patch",
            href: "/images",
            more: ["imagesId"],
            body: {
              name: {
                type: "string",
                unique: true,
                content:
                  "mainTag_subTag_optionalTag, if tags changed, this.required = true",
              },
              imageUrl: {
                type: "string",
                content: "if Image's Url changed, this.required = true",
              },
              tags: {
                main: { type: "string", content: "mainTag's value" },
                sub: { type: "string", content: "subTag's value" },
                optional: {
                  type: "string",
                  content:
                    "optionalTag's value, if Game's optinalTagName existed, this.require = true",
                },
              },
            },
          },
          deleteImages: {
            rel: "images",
            method: "delete",
            href: "/images",
            more: ["imagesId"],
            body: {},
          },
          editGames: {
            rel: "update",
            method: "patch",
            href: "/games",
            more: ["gameId"],
            body: {
              name: { type: "string", required: true, content: "Game's Name" },
              updated: { required: true, type: "Date", content: "Date.now()" },
            },
          },
          getGames: {
            rel: "games",
            method: "get",
            href: "/games/0",
            more: [],
          },
        };

    ctx.status = 200;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

module.exports = {
  getGames,
  getImages,
};
