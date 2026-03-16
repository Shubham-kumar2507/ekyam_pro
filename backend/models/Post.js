const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    postType: { type: String, enum: ['individual', 'community'], default: 'individual' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 }
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
