const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/profiles', 'uploads/projects', 'uploads/project-files', 'uploads/resources', 'uploads/posts', 'uploads/communities'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (req.uploadType === 'profile') folder = 'uploads/profiles/';
        else if (req.uploadType === 'project') folder = 'uploads/projects/';
        else if (req.uploadType === 'project-files') folder = 'uploads/project-files/';
        else if (req.uploadType === 'resource') folder = 'uploads/resources/';
        else if (req.uploadType === 'post') folder = 'uploads/posts/';
        else if (req.uploadType === 'community') folder = 'uploads/communities/';
        cb(null, path.join(__dirname, '..', folder));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Blocked extensions — dangerous executables and scripts
const blockedExtensions = /\.(exe|bat|cmd|msi|scr|com|vbs|ps1|sh|jar|dll|pif|cpl|inf|reg|ws|wsf|hta)$/i;

// Allowed MIME types per upload category
const allowedMimes = {
    profile: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    community: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    project: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    post: /^(image|video)\//,
    resource: null,  // allow all non-blocked types for resources
    'project-files': null,
};

const fileFilter = (req, file, cb) => {
    // Check blocked extensions
    if (blockedExtensions.test(file.originalname)) {
        return cb(new Error('This file type is not allowed for security reasons'), false);
    }

    // MIME type validation for specific upload types
    const mimePattern = allowedMimes[req.uploadType];
    if (mimePattern && !mimePattern.test(file.mimetype)) {
        return cb(new Error(`Invalid file type for ${req.uploadType} upload. Got: ${file.mimetype}`), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Middleware wrappers that set upload type
const profileUpload = (req, res, next) => { req.uploadType = 'profile'; next(); };
const projectUpload = (req, res, next) => { req.uploadType = 'project'; next(); };
const projectFileUpload = (req, res, next) => { req.uploadType = 'project-files'; next(); };
const resourceUpload = (req, res, next) => { req.uploadType = 'resource'; next(); };
const postUpload = (req, res, next) => { req.uploadType = 'post'; next(); };
const communityUpload = (req, res, next) => { req.uploadType = 'community'; next(); };

module.exports = { upload, profileUpload, projectUpload, projectFileUpload, resourceUpload, postUpload, communityUpload };
