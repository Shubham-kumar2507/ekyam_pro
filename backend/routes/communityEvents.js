const express = require('express');
const router = express.Router();
const CommunityEvent = require('../models/CommunityEvent');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

// GET events for a community
router.get('/:communityId/events', async (req, res) => {
    try {
        const { month } = req.query; // optional YYYY-MM filter
        let query = { communityId: req.params.communityId };

        if (month) {
            const start = new Date(`${month}-01`);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            query.startDate = { $gte: start, $lt: end };
        }

        const events = await CommunityEvent.find(query)
            .sort({ startDate: 1 })
            .populate('createdBy', 'username fullName');
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create event (admin only)
router.post('/:communityId/events', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can create events' });

        const { title, description, startDate, endDate, location, eventType } = req.body;
        if (!title || !startDate) return res.status(400).json({ message: 'Title and start date are required' });

        const event = await CommunityEvent.create({
            communityId: req.params.communityId,
            title, description, startDate, endDate, location, eventType,
            createdBy: req.user._id
        });
        res.status(201).json(event);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE event (admin only)
router.delete('/:communityId/events/:eventId', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can delete events' });

        await CommunityEvent.findByIdAndDelete(req.params.eventId);
        res.json({ message: 'Event deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
