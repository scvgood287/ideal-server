const { Schema, model } = require('mongoose');

const ImageRateLogSchema = new Schema({
  imageId: { type: Schema.Types.ObjectId, ref: 'Image', required: true, },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, },
  first: { type: Number, min: 0, max: 1, required: true, },
  entry: { type: Number, min: 0, max: 1, required: true, },
  win: { type: Number, min: 0, required: true, },
  lose: { type: Number, min: 0, max: 1, required: true, },
});

const ImageRateLog = model('ImageRateLog', ImageRateLogSchema);

module.exports = ImageRateLog;