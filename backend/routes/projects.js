const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { upload, projectUpload, projectFileUpload } = require('../middleware/upload');

// Helper: escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// GET all projects
router.get('/', async (req, res) => {
    try {
        const { search, status, communityId } = req.query;
        let query = {};
        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
        if (status) query.status = status;
        if (communityId) query.communityId = communityId;
        const projects = await Project.find(query)
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET featured projects (MUST be above /:id)
router.get('/featured', async (req, res) => {
    try {
        const projects = await Project.find({ isFeatured: true })
            .populate('createdBy', 'username fullName')
            .populate('communityId', 'name')
            .limit(3);
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET user's projects (MUST be above /:id)
router.get('/my', protect, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ createdBy: req.user._id }, { 'members.userId': req.user._id }]
        }).populate('communityId', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/user/me', protect, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ createdBy: req.user._id }, { 'members.userId': req.user._id }]
        }).populate('communityId', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .populate('members.userId', 'username fullName profileImage');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create project (with optional image upload)
router.post('/', protect, projectUpload, upload.single('image'), async (req, res) => {
    try {
        const { name, description, status, startDate, endDate, communityId } = req.body;
        if (!name || !description) return res.status(400).json({ message: 'Name and description are required' });

        const projectData = {
            name, description,
            status: status || 'planning',
            startDate: startDate || null,
            endDate: endDate || null,
            communityId: communityId || null,
            createdBy: req.user._id,
            members: [{ userId: req.user._id, role: 'creator' }],
            memberCount: 1
        };
        if (req.file) projectData.image = `/uploads/projects/${req.file.filename}`;

        const project = await Project.create(projectData);
        res.status(201).json(project);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update project
router.put('/:id', protect, projectUpload, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const allowedFields = ['name', 'description', 'status', 'startDate', 'endDate', 'communityId', 'isFeatured'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });
        if (req.file) updateData.image = `/uploads/projects/${req.file.filename}`;

        const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE project
router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.userType !== 'system_admin')
            return res.status(403).json({ message: 'Not authorized' });
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST join project
router.post('/:id/join', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        const alreadyMember = project.members.find(m => m.userId.toString() === req.user._id.toString());
        if (alreadyMember) return res.status(400).json({ message: 'Already a member' });
        project.members.push({ userId: req.user._id, role: req.body.role || 'member' });
        project.memberCount = project.members.length;
        await project.save();
        res.json({ message: 'Joined project successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// POST upload files to a project
router.post('/:id/files', protect, projectFileUpload, upload.array('files', 10), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isMember = project.members.some(m => m.userId.toString() === req.user._id.toString());
        if (!isMember) return res.status(403).json({ message: 'Only project members can upload files' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const newFiles = req.files.map(f => ({
            fileName: f.originalname,
            filePath: `/uploads/project-files/${f.filename}`,
            fileSize: f.size
        }));

        project.files = [...(project.files || []), ...newFiles];
        await project.save();

        res.status(201).json({ message: `${newFiles.length} file(s) uploaded`, files: project.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a file from a project
router.delete('/:id/files/:fileIndex', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const idx = parseInt(req.params.fileIndex);
        if (isNaN(idx) || idx < 0 || idx >= (project.files || []).length) {
            return res.status(400).json({ message: 'Invalid file index' });
        }

        project.files.splice(idx, 1);
        await project.save();

        res.json({ message: 'File removed', files: project.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
