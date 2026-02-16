const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    
    return {
      folder: 'snaplink/messages',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo 
        ? ['mp4', 'mov', 'avi', 'mkv', 'webm']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: isVideo 
        ? [{ quality: 'auto' }]
        : [{ width: 1920, height: 1920, crop: 'limit', quality: 'auto' }],
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, MKV, WebM) are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Upload single file
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    // Generate thumbnail for videos
    let thumbnailUrl = null;
    if (fileType === 'video') {
      // Cloudinary automatically generates thumbnails for videos
      thumbnailUrl = cloudinary.url(req.file.filename, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
        ],
      });
    }

    const fileData = {
      type: fileType,
      url: req.file.path,
      publicId: req.file.filename,
      filename: req.file.originalname,
      size: req.file.size,
      thumbnail: thumbnailUrl,
    };

    console.log('✅ File uploaded:', fileData);
    return res.status(200).json({ file: fileData });
  } catch (error) {
    console.error('Upload error:', error);
    return next(error);
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const filesData = await Promise.all(
      req.files.map(async (file) => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        let thumbnailUrl = null;
        if (fileType === 'video') {
          thumbnailUrl = cloudinary.url(file.filename, {
            resource_type: 'video',
            format: 'jpg',
            transformation: [
              { width: 400, height: 400, crop: 'fill' },
            ],
          });
        }

        return {
          type: fileType,
          url: file.path,
          publicId: file.filename,
          filename: file.originalname,
          size: file.size,
          thumbnail: thumbnailUrl,
        };
      })
    );

    console.log('✅ Files uploaded:', filesData.length);
    return res.status(200).json({ files: filesData });
  } catch (error) {
    console.error('Upload error:', error);
    return next(error);
  }
};

// Delete file from Cloudinary
const deleteFile = async (req, res, next) => {
  try {
    const { publicId, resourceType } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
    });

    console.log('✅ File deleted:', publicId);
    return res.status(200).json({ message: 'File deleted successfully', result });
  } catch (error) {
    console.error('Delete error:', error);
    return next(error);
  }
};

module.exports = {
  upload,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
};
