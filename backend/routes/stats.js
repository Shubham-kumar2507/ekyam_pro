const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');
const Project = require('../models/Project');
const Resource = require('../models/Resource');

// GET platform stats
router.get('/', async (req, res) => {
    try {
        const [communities, projects, resources, members] = await Promise.all([
            Community.countDocuments(),
            Project.countDocuments(),
            Resource.countDocuments(),
            User.countDocuments()
        ]);
        res.json({ communities, projects, resources, members });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
