const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityMember', communityMemberSchema);
