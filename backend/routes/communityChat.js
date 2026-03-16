const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const CommunityMember = require('../models/CommunityMember');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

// Check membership helper
async function isMemberOrAdmin(communityId, userId) {
    const community = await Community.findById(communityId);
    if (!community) return false;
    if (community.adminId.toString() === userId.toString()) return true;
    const member = await CommunityMember.findOne({ communityId, userId });
    return !!member;
}

// GET messages for a community (last 50)
router.get('/:communityId/messages', protect, async (req, res) => {
    try {
        const allowed = await isMemberOrAdmin(req.params.communityId, req.user._id);
        if (!allowed) return res.status(403).json({ message: 'You must be a member to view chat' });

        const messages = await ChatMessage.find({ communityId: req.params.communityId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('userId', 'username fullName profileImage');

        // Return in chronological order (oldest first)
        res.json(messages.reverse());
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST send a message
router.post('/:communityId/messages', protect, async (req, res) => {
    try {
        const allowed = await isMemberOrAdmin(req.params.communityId, req.user._id);
        if (!allowed) return res.status(403).json({ message: 'You must be a member to send messages' });

        const { message } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

        const chatMsg = await ChatMessage.create({
            communityId: req.params.communityId,
            userId: req.user._id,
            message: message.trim()
        });

        const populated = await ChatMessage.findById(chatMsg._id).populate('userId', 'username fullName profileImage');
        res.status(201).json(populated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET community members for sidebar
router.get('/:communityId/online', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId).populate('adminId', 'username fullName profileImage');
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const members = await CommunityMember.find({ communityId: req.params.communityId })
            .populate('userId', 'username fullName profileImage')
            .limit(20);

        // Include admin at the top
        const result = [];
        if (community.adminId) {
            result.push({
                _id: community.adminId._id,
                fullName: community.adminId.fullName,
                username: community.adminId.username,
                profileImage: community.adminId.profileImage,
                role: 'admin'
            });
        }
        members.forEach(m => {
            if (m.userId && m.userId._id.toString() !== community.adminId?._id?.toString()) {
                result.push({
                    _id: m.userId._id,
                    fullName: m.userId.fullName,
                    username: m.userId.username,
                    profileImage: m.userId.profileImage,
                    role: m.role || 'member'
                });
            }
        });

        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
