const Router = require("koa-router");
const {
  commons: { getGames, getImages },
  gameManagements: { postGames, editGames, deleteGames },
  imageManagements: { uploadToS3, postImages, editImages, deleteImages },
  playGames: { getRounds, getRates, postLogs },
} = require("./controllers");
const {
  s3: { uploadtoS3Any },
} = require("aws");

const ideals = new Router();

// 공용

ideals.get("/games/:onlyPlayableGames", getGames);
ideals.get("/images/:gameId/:round", getImages);

// 게임 관리 클라이언트

// 게임 관리 페이즈

ideals.post("/games", postGames);
ideals.patch("/games/:gameId", editGames);
ideals.delete("/games/:gameId", deleteGames);

// 게임 선택 후 이미지 관리 페이즈

ideals.post("/toS3", uploadtoS3Any(), uploadToS3);
ideals.post("/images/:gameId", postImages);
ideals.patch("/images/:imageId", editImages);
ideals.delete("/images/:imageId", deleteImages);

// 게임 플레이 클라이언트

ideals.get("/rounds/:gameId", getRounds);
ideals.get("/rates/:gameId/:top", getRates);
ideals.post("/logs/:gameId", postLogs);

module.exports = ideals;
