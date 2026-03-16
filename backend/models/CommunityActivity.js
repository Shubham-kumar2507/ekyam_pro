const mongoose = require('mongoose');

const communityActivitySchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, required: true },
    activityDate: { type: Date, default: Date.now }
}, { timestamps: true });

communityActivitySchema.index({ communityId: 1, activityDate: -1 });

module.exports = mongoose.model('CommunityActivity', communityActivitySchema);
