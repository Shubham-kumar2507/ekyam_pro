const mongoose = require('mongoose');

const communityEventSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    location: { type: String, default: '' },
    eventType: { type: String, enum: ['meeting', 'workshop', 'social', 'other'], default: 'meeting' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

communityEventSchema.index({ communityId: 1, startDate: 1 });

module.exports = mongoose.model('CommunityEvent', communityEventSchema);
