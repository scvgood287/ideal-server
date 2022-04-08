const { Schema, model } = require('mongoose');

const GameSchema = new Schema({
  name: { type: String, required: true, unique: true, },
  tagNames: {
    main: { type: String, required: true, },
    sub: { type: String, required: true, },
    optional: { type: String, },
  },
  imagesCount: { type: Number, default: 0, min: 0, },
  playCount: { type: Number, default: 0, min: 0, },
  isPlayable: { type: Number, default: 0, min: 0, max: 1, },
  updated: { type: Date, default: Date.now(), index: 1 },
});

GameSchema.index({ isPlayable: -1, playCount: -1 });

const Game = model('Game', GameSchema);

module.exports = Game;