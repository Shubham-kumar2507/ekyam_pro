const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const Community = require('../models/Community');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Helper: escape special regex characters
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Dashboard Stats ───
router.get('/stats', async (req, res) => {
    try {
        const [users, projects, resources, communities] = await Promise.all([
            User.countDocuments(),
            Project.countDocuments(),
            Resource.countDocuments(),
            Community.countDocuments()
        ]);

        const featuredProjects = await Project.countDocuments({ isFeatured: true });

        // Recent signups (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Projects by status
        const projectsByStatus = await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Resources by type
        const resourcesByType = await Resource.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            users, projects, resources, communities,
            featuredProjects, recentSignups,
            projectsByStatus, resourcesByType
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Projects Management ───
router.get('/projects', async (req, res) => {
    try {
        const { search, status, featured } = req.query;
        let query = {};
        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
        if (status) query.status = status;
        if (featured === 'true') query.isFeatured = true;
        if (featured === 'false') query.isFeatured = false;

        const projects = await Project.find(query)
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle featured status
router.put('/projects/:id/feature', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.isFeatured = !project.isFeatured;
        await project.save();
        res.json({ message: `Project ${project.isFeatured ? 'featured' : 'unfeatured'}`, project });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change project status
router.put('/projects/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['planning', 'active', 'in_progress', 'completed', 'on_hold'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const project = await Project.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        ).populate('createdBy', 'username fullName');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Status updated', project });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete any project
router.delete('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Resources Management ───
router.get('/resources', async (req, res) => {
    try {
        const { search, type } = req.query;
        let query = {};
        if (search) query.title = { $regex: escapeRegex(search), $options: 'i' };
        if (type) query.type = type;

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete any resource
router.delete('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Users Management ───
router.get('/users', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            const escaped = escapeRegex(search);
            query = {
                $or: [
                    { username: { $regex: escaped, $options: 'i' } },
                    { fullName: { $regex: escaped, $options: 'i' } },
                    { email: { $regex: escaped, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { userType } = req.body;
        const validTypes = ['individual', 'community_admin', 'system_admin'];
        if (!validTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Prevent admin from demoting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id, { userType }, { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User role updated', user });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
