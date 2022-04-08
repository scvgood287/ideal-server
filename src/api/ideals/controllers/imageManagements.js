const { Game, Image, ImageRateLog } = require("models/ideals");
const {
  s3: { deleteS3Image },
} = require("aws");

// 추후 에러시 s3이미지 삭제하는 것도 해야함
const uploadToS3 = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const { location, key } = ctx.request.files[0];

  const imageUrl = {
    host: process.env.CLOUDFRONT_URL,
    pathname: location.replace(`${process.env.AWS_S3_URL}/`, ""),
    key,
  };

  ctx.body = {
    imageUrl,
  };
};

const postImages = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    request: { body },
    params: { gameId },
  } = ctx;

  try {
    const newImages = await Image.insertMany(body);
    const imagesCount = await Image.countDocuments({ gameId });
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { $set: { imagesCount } },
      { new: true }
    );

    const data = {
      newImages,
      updatedGame,
    };
    const links = {
      getImages: {
        rel: "images",
        method: "get",
        href: `/images/${gameId}/0`,
        more: [],
      },
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
          imageUrl: { required: true, type: "string", content: "Image's Url" },
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
            sub: { required: true, type: "string", content: "subTag's value" },
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
        href: `/games/${gameId}`,
        more: [],
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

    ctx.status = 201;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const editImages = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    request: { body },
    params: { imageId },
  } = ctx;

  try {
    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      { $set: body },
      { new: true }
    );
    const gameId = updatedImage.gameId;

    const data = updatedImage;
    const links = {
      getImages: {
        rel: "images",
        method: "get",
        href: `/images/${gameId}/0`,
        more: [],
      },
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
          imageUrl: { required: true, type: "string", content: "Image's Url" },
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
            sub: { required: true, type: "string", content: "subTag's value" },
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
        href: `/games/${gameId}`,
        more: [],
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

    ctx.status = 201;
    ctx.body = { data, links };
  } catch (err) {
    ctx.throw(500, err);
  }
};

const deleteImages = async (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  const {
    params: { imageId },
  } = ctx;

  try {
    const deletedImage = await Image.findByIdAndDelete(imageId);
    const { gameId, } = deletedImage;
    const deletedImageRateLog = await ImageRateLog.deleteMany({ imageId });
    const imagesCount = await Image.countDocuments({ gameId });
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { $set: { imagesCount } },
      { new: true }
    );
    await deleteS3Image(deletedImage);

    const data = {
      deletedImage,
      deletedImageRateLog,
      updatedGame,
    };
    const links = {
      getImages: {
        rel: "images",
        method: "get",
        href: `/images/${gameId}/0`,
        more: [],
      },
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
          imageUrl: { required: true, type: "string", content: "Image's Url" },
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
            sub: { required: true, type: "string", content: "subTag's value" },
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
        href: `/games/${gameId}`,
        more: [],
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
  uploadToS3,
  postImages,
  editImages,
  deleteImages,
};
