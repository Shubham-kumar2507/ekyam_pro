const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['follow', 'connect'], default: 'follow' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' }
}, { timestamps: true });

connectionSchema.index({ follower: 1, following: 1 }, { unique: true });
connectionSchema.index({ following: 1, status: 1 });
connectionSchema.index({ follower: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
