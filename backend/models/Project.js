const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['planning', 'active', 'in_progress', 'completed', 'on_hold'], default: 'planning' },
    image: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
    memberCount: { type: Number, default: 1 },
    files: [{
        fileName: { type: String },
        filePath: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
