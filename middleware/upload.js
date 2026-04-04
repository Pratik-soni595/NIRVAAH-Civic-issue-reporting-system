/**
 * File Upload Middleware
 * Uses Multer with Cloudinary storage for complaint images
 * Exports:
 *   upload        — original complaint image uploader (multi-file)
 *   uploadResolution — TRS resolution evidence uploader (single file, separate folder)
 */
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── Complaint image storage ────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nirvaah/complaints',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto' }
    ]
  }
});

// ── TRS Resolution evidence storage ──────────────────────────────────────
// Stored in a separate folder with a distinct tag for audit purposes.
const resolutionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nirvaah/resolution-evidence',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 1200, crop: 'limit', quality: 'auto:best' }
    ],
    tags: ['trs', 'resolution-evidence']
  }
});

// File filter — JPEG/PNG/WebP only (no GIF for resolution evidence)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'), false);
  }
};

const resolutionFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG or WebP images are allowed for resolution evidence'), false);
  }
};

// ── Exported middleware instances ──────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5                   // Max 5 images per complaint
  }
});

const uploadResolution = multer({
  storage: resolutionStorage,
  fileFilter: resolutionFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for higher-res resolution photo
    files: 1                    // Exactly one resolution image
  }
});

module.exports = upload;
module.exports.uploadResolution = uploadResolution;
