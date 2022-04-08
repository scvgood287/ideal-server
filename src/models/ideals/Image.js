const { Schema, model } = require("mongoose");

const ImageSchema = new Schema({
  name: { type: String, required: true, unique: true },
  tags: {
    main: { type: String, required: true },
    sub: { type: String, required: true },
    optional: { type: String },
  },
  imageUrl: {
    host: { type: String, required: true, },
    pathname: { type: String, required: true, unique: true },
    key: { type: String, required: true },
  },
  gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  firstRate: { type: Number, default: 0, min: 0, max: 100 },
  winRate: { type: Number, default: 0, min: 0, max: 100 },
  first: { type: Number, default: 0, min: 0 },
  entry: { type: Number, default: 0, min: 0 },
  win: { type: Number, default: 0, min: 0 },
  lose: { type: Number, default: 0, min: 0 },
});

ImageSchema.index({
  gameId: 1,
  firstRate: -1,
  winRate: -1,
  entry: 1,
  lose: 1,
});
ImageSchema.index({ gameId: 1, name: 1 });

const Image = model("Image", ImageSchema);

module.exports = Image;
