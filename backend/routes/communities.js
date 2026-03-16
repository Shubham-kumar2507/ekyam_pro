const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET all communities
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
        if (category) query.category = category;
        const communities = await Community.find(query).populate('adminId', 'username fullName').sort({ createdAt: -1 });
        res.json(communities);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET communities the current user joined (MUST be above /:id to avoid route conflict)
router.get('/user/joined', protect, async (req, res) => {
    try {
        const memberships = await CommunityMember.find({ userId: req.user._id }).populate('communityId');
        res.json(memberships.map(m => m.communityId).filter(Boolean));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single community
router.get('/:id', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id).populate('adminId', 'username fullName');
        if (!community) return res.status(404).json({ message: 'Community not found' });
        const members = await CommunityMember.find({ communityId: req.params.id }).populate('userId', 'username fullName location profileImage');
        res.json({ ...community.toObject(), members });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create community
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, location, category, image } = req.body;
        const community = await Community.create({ name, description, location, category, image, adminId: req.user._id });
        await User.findByIdAndUpdate(req.user._id, { userType: 'community_admin', communityId: community._id });
        res.status(201).json(community);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update community
router.put('/:id', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        const updated = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE community
router.delete('/:id', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString() && req.user.userType !== 'system_admin')
            return res.status(403).json({ message: 'Not authorized' });
        await Community.findByIdAndDelete(req.params.id);
        res.json({ message: 'Community removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST join community
router.post('/:id/join', protect, async (req, res) => {
    try {
        const existing = await CommunityMember.findOne({ communityId: req.params.id, userId: req.user._id });
        if (existing) return res.status(400).json({ message: 'Already a member' });
        await CommunityMember.create({ communityId: req.params.id, userId: req.user._id });
        const count = await CommunityMember.countDocuments({ communityId: req.params.id });
        await Community.findByIdAndUpdate(req.params.id, { memberCount: count + 1 });
        res.json({ message: 'Joined successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST leave community
router.post('/:id/leave', protect, async (req, res) => {
    try {
        await CommunityMember.findOneAndDelete({ communityId: req.params.id, userId: req.user._id });
        const count = await CommunityMember.countDocuments({ communityId: req.params.id });
        await Community.findByIdAndUpdate(req.params.id, { memberCount: count });
        res.json({ message: 'Left community' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET members of a community
router.get('/:id/members', async (req, res) => {
    try {
        const members = await CommunityMember.find({ communityId: req.params.id }).populate('userId', 'username fullName location profileImage');
        res.json(members);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// (Route moved above /:id for correct ordering)

// PUT update member role (admin only)
router.put('/:id/members/:userId/role', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can update roles' });

        const member = await CommunityMember.findOneAndUpdate(
            { communityId: req.params.id, userId: req.params.userId },
            { role: req.body.role },
            { new: true }
        ).populate('userId', 'username fullName profileImage');
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json(member);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE remove member (admin only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can remove members' });

        await CommunityMember.findOneAndDelete({ communityId: req.params.id, userId: req.params.userId });
        const count = await CommunityMember.countDocuments({ communityId: req.params.id });
        await Community.findByIdAndUpdate(req.params.id, { memberCount: count });
        res.json({ message: 'Member removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET community stats
router.get('/:id/stats', async (req, res) => {
    try {
        const Project = require('../models/Project');
        const Resource = require('../models/Resource');
        const CommunityActivity = require('../models/CommunityActivity');

        const members = await CommunityMember.countDocuments({ communityId: req.params.id });
        const projects = await Project.countDocuments({ communityId: req.params.id });
        const resources = await Resource.countDocuments({ communityId: req.params.id });

        // Active members = distinct users with activity in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeResult = await CommunityActivity.distinct('userId', {
            communityId: req.params.id,
            activityDate: { $gte: thirtyDaysAgo }
        });

        res.json({
            members: members + 1, // +1 for admin
            projects,
            resources,
            active_members: activeResult.length
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET recent activity for community
router.get('/:id/activity', async (req, res) => {
    try {
        const CommunityActivity = require('../models/CommunityActivity');
        const activities = await CommunityActivity.find({ communityId: req.params.id })
            .sort({ activityDate: -1 })
            .limit(10)
            .populate('userId', 'username fullName');
        res.json(activities);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
