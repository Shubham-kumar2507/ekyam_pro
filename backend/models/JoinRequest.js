const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
    type: { type: String, enum: ['project', 'community'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
}, { timestamps: true });

// Prevent duplicate pending requests
joinRequestSchema.index({ type: 1, targetId: 1, userId: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
