const Router = require('koa-router');
const ideals = require('./ideals');

const api = new Router();

api.use('/ideals', ideals.routes())

module.exports = api;