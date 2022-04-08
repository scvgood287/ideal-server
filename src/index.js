require('dotenv').config();

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const api = require('./api');

const PORT = process.env.PORT || 8081;
const MONGO_URI = process.env.MONGO_URI;

mongoose.Promise = global.Promise; // Node 의 네이티브 Promise 사용
// mongodb 연결
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then((response) => {
  console.log('Successfully connected to mongodb');
  // console.log(response);
})
.catch((error) => { console.log(error); })

app.use(bodyParser()); // 바디파서 적용, 라우터 적용코드보다 상단에 있어야합니다.
router.get('/', (ctx) => {
  ctx.status = 200;
});
router.use('/api', api.routes()); // api 라우트를 /api 경로 하위 라우트로 설정
app.use(router.routes()).use(router.allowedMethods());
app.use(cors());

app.listen(PORT, () => {
    console.log(`pnpdb server is listening to port ${PORT}`);
});