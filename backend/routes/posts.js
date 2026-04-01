const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Connection = require('../models/Connection');
const { protect } = require('../middleware/auth');
const { upload, postUpload } = require('../middleware/upload');

// GET feed – posts from followed users + own posts
router.get('/feed', protect, async (req, res) => {
    try {
        // Get list of users the current user follows
        const connections = await Connection.find({
            follower: req.user._id,
            status: 'accepted'
        }).select('following');
        const followingIds = connections.map(c => c.following);
        followingIds.push(req.user._id); // include own posts

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: { $in: followingIds } })
            .populate('author', 'username fullName profileImage')
            .populate('project', 'name')
            .populate('community', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ author: { $in: followingIds } });

        res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all posts (public feed / explore)
router.get('/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('author', 'username fullName profileImage')
            .populate('project', 'name')
            .populate('community', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();
        res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET posts by community
router.get('/community/:communityId', async (req, res) => {
    try {
        const posts = await Post.find({ community: req.params.communityId })
            .populate('author', 'username fullName profileImage')
            .populate('project', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET posts by project
router.get('/project/:projectId', async (req, res) => {
    try {
        const posts = await Post.find({ project: req.params.projectId })
            .populate('author', 'username fullName profileImage')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET posts by user
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'username fullName profileImage')
            .populate('project', 'name')
            .populate('community', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create a new post (with optional media upload, up to 5 files)
router.post('/', protect, postUpload, upload.array('media', 5), async (req, res) => {
    try {
        const { content, postType, project, community } = req.body;
        if (!content && (!req.files || req.files.length === 0)) {
            return res.status(400).json({ message: 'Post must have text content or media' });
        }

        // If posting to a project, check membership
        if (project) {
            const Project = require('../models/Project');
            const proj = await Project.findById(project);
            if (!proj) return res.status(404).json({ message: 'Project not found' });
            const isCreator = proj.createdBy.toString() === req.user._id.toString();
            const isMember = proj.members.some(m => m.userId.toString() === req.user._id.toString());
            if (!isCreator && !isMember) {
                return res.status(403).json({ message: 'Only project members or the owner can post updates' });
            }
        }

        // If posting to a community, check membership
        if (community) {
            const Community = require('../models/Community');
            const CommunityMember = require('../models/CommunityMember');
            const comm = await Community.findById(community);
            if (!comm) return res.status(404).json({ message: 'Community not found' });
            const isAdmin = comm.adminId.toString() === req.user._id.toString();
            const membership = await CommunityMember.findOne({ communityId: community, userId: req.user._id });
            if (!isAdmin && !membership) {
                return res.status(403).json({ message: 'Only community members or the admin can post updates' });
            }
        }

        const media = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const isVideo = file.mimetype.startsWith('video/');
                media.push({
                    url: `/uploads/posts/${file.filename}`,
                    type: isVideo ? 'video' : 'image'
                });
            });
        }

        const post = await Post.create({
            author: req.user._id,
            content: content || '',
            media,
            postType: postType || 'individual',
            project: project || null,
            community: community || null
        });

        const populated = await Post.findById(post._id)
            .populate('author', 'username fullName profileImage')
            .populate('project', 'name')
            .populate('community', 'name');

        res.status(201).json(populated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a post
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Comment.deleteMany({ post: post._id });
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST toggle like
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const idx = post.likes.indexOf(req.user._id);
        if (idx === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(idx, 1);
        }
        post.likeCount = post.likes.length;
        await post.save();

        res.json({ liked: idx === -1, likeCount: post.likeCount });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'username fullName profileImage')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add comment
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await Comment.create({
            post: req.params.id,
            author: req.user._id,
            content
        });

        post.commentCount = await Comment.countDocuments({ post: req.params.id });
        await post.save();

        const populated = await Comment.findById(comment._id)
            .populate('author', 'username fullName profileImage');

        res.status(201).json(populated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE comment
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Comment.findByIdAndDelete(req.params.commentId);

        const post = await Post.findById(req.params.postId);
        if (post) {
            post.commentCount = await Comment.countDocuments({ post: req.params.postId });
            await post.save();
        }

        res.json({ message: 'Comment deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST share (increment share count)
router.post('/:id/share', protect, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { shareCount: 1 } },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ shareCount: post.shareCount });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
