const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    memberCount: { type: Number, default: 1 },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coordinates: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        address: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
