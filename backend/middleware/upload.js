const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Blocked extensions — dangerous executables and scripts
const blockedExtensions = /\.(exe|bat|cmd|msi|scr|com|vbs|ps1|sh|jar|dll|pif|cpl|inf|reg|ws|wsf|hta)$/i;

// Allowed MIME types per upload category
const allowedMimes = {
    profile: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    community: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    project: /^image\/(jpeg|png|gif|webp|svg\+xml)$/,
    post: /^(image|video)\//,
    resource: null,       // allow all non-blocked types
    'project-files': null,
};

// Determine Cloudinary resource_type from mimetype
function getResourceType(mimetype) {
    if (!mimetype) return 'auto';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('image/')) return 'image';
    return 'raw'; // PDFs, ZIPs, docs, etc.
}

// Build a Cloudinary storage for a given folder/uploadType
function makeStorage(folderName, uploadType) {
    return new CloudinaryStorage({
        cloudinary,
        params: (req, file) => {
            const resourceType = getResourceType(file.mimetype);
            return {
                folder: `ekyam/${folderName}`,
                resource_type: resourceType,
                // Keep original extension for raw files, let Cloudinary handle images/videos
                format: resourceType === 'raw' ? undefined : undefined,
                public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            };
        },
    });
}

// File filter shared across all upload types
const fileFilter = (req, file, cb) => {
    if (blockedExtensions.test(file.originalname)) {
        return cb(new Error('This file type is not allowed for security reasons'), false);
    }
    const mimePattern = allowedMimes[req.uploadType];
    if (mimePattern && !mimePattern.test(file.mimetype)) {
        return cb(new Error(`Invalid file type for ${req.uploadType} upload. Got: ${file.mimetype}`), false);
    }
    cb(null, true);
};

// Create separate multer instances per upload type so each gets the right Cloudinary folder
const uploaders = {
    profile: multer({ storage: makeStorage('profiles', 'profile'), fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }),
    project: multer({ storage: makeStorage('projects', 'project'), fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }),
    'project-files': multer({ storage: makeStorage('project-files', 'project-files'), fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }),
    resource: multer({ storage: makeStorage('resources', 'resource'), fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }),
    post: multer({ storage: makeStorage('posts', 'post'), fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }),
    community: multer({ storage: makeStorage('communities', 'community'), fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }),
};

// Middleware wrappers that set uploadType AND inject the correct multer instance
const profileUpload = (req, res, next) => { req.uploadType = 'profile'; next(); };
const projectUpload = (req, res, next) => { req.uploadType = 'project'; next(); };
const projectFileUpload = (req, res, next) => { req.uploadType = 'project-files'; next(); };
const resourceUpload = (req, res, next) => { req.uploadType = 'resource'; next(); };
const postUpload = (req, res, next) => { req.uploadType = 'post'; next(); };
const communityUpload = (req, res, next) => { req.uploadType = 'community'; next(); };

// A smart "upload" proxy that picks the right uploader based on req.uploadType
const upload = {
    single: (fieldName) => (req, res, next) => {
        const uploader = uploaders[req.uploadType] || uploaders.post;
        uploader.single(fieldName)(req, res, next);
    },
    array: (fieldName, maxCount) => (req, res, next) => {
        const uploader = uploaders[req.uploadType] || uploaders.post;
        uploader.array(fieldName, maxCount)(req, res, next);
    },
    fields: (fields) => (req, res, next) => {
        const uploader = uploaders[req.uploadType] || uploaders.resource;
        uploader.fields(fields)(req, res, next);
    },
};

module.exports = {
    upload,
    cloudinary,
    profileUpload,
    projectUpload,
    projectFileUpload,
    resourceUpload,
    postUpload,
    communityUpload,
};
