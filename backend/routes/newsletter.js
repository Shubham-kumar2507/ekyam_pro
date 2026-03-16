const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// POST subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Newsletter.findOne({ email });
        if (exists) {
            if (!exists.isActive) {
                exists.isActive = true;
                await exists.save();
                return res.json({ message: 'Resubscribed successfully!' });
            }
            return res.status(400).json({ message: 'Already subscribed' });
        }
        await Newsletter.create({ email });
        res.json({ message: 'Subscribed successfully!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE unsubscribe
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        await Newsletter.findOneAndUpdate({ email }, { isActive: false });
        res.json({ message: 'Unsubscribed successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
