const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/profiles', 'uploads/projects', 'uploads/project-files', 'uploads/resources', 'uploads/posts'];
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
        cb(null, path.join(__dirname, '..', folder));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter – allow all file types EXCEPT dangerous executables
const blockedExtensions = /\.(exe|bat|cmd|msi|scr|com|vbs)$/i;
const fileFilter = (req, file, cb) => {
    if (blockedExtensions.test(file.originalname)) {
        cb(new Error('Executable file types are not allowed'), false);
    } else {
        cb(null, true);
    }
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

module.exports = { upload, profileUpload, projectUpload, projectFileUpload, resourceUpload, postUpload };

