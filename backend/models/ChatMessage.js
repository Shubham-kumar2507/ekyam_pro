const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
}, { timestamps: true });

chatMessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
