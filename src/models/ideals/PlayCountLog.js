const { Schema, model } = require('mongoose');

const PlayCountLogSchema = new Schema({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, },
});

const PlayCountLog = model('PlayCountLog', PlayCountLogSchema);

module.exports = PlayCountLog;