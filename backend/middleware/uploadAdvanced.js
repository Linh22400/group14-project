const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Tạo thư mục temp nếu chưa tồn tại
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Cấu hình Cloudinary Storage với transformation
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      // Kiểm tra user có tồn tại không
      if (!req.user || !req.user.id) {
        throw new Error('User chưa được xác thực');
      }
      
      return {
        folder: 'user-avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        public_id: `avatar-${req.user.id}-${Date.now()}`
      };
    } catch (error) {
      console.error('Lỗi CloudinaryStorage params:', error);
      throw error;
    }
  }
});

// Middleware để resize ảnh trước khi upload
const resizeAvatar = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const tempPath = path.join(tempDir, `temp-${Date.now()}-${req.file.originalname}`);
    
    // Resize ảnh với Sharp
    const imageBuffer = req.file.buffer;
    
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('File ảnh trống hoặc không hợp lệ');
    }

    // Kiểm tra định dạng ảnh trước khi xử lý
    const metadata = await sharp(imageBuffer).metadata().catch(() => null);
    if (!metadata) {
      throw new Error('File không phải là định dạng ảnh được hỗ trợ');
    }

    await sharp(imageBuffer)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(tempPath);

    // Cập nhật buffer
    req.file.buffer = await sharp(tempPath).toBuffer();

    // Dọn dẹp file temp sau khi xử lý
    req.on('end', () => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    });

    next();
  } catch (error) {
    console.error('Lỗi resize avatar:', error);
    // Trả về lỗi JSON thay vì throw
    return res.status(400).json({
      success: false,
      message: 'Lỗi xử lý ảnh: ' + error.message
    });
  }
};

// Cấu hình multer với memory storage để xử lý buffer
const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// Wrapper middleware để xử lý lỗi Cloudinary
const uploadCloudinaryWithError = (req, res, next) => {
  console.log('🚀 uploadCloudinary middleware called');
  console.log('Headers:', req.headers);
  console.log('User:', req.user);
  console.log('Body:', req.body);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  const upload = multer({ 
    storage: cloudinaryStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      console.log('File filter - file:', file);
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
      }
    }
  }).single('avatar');
  
  upload(req, res, function (error) {
    console.log('📤 Cloudinary upload callback triggered');
    console.log('Error in callback:', error);
    console.log('Request file after upload:', req.file);
    
    if (error) {
      console.error('❌ Cloudinary upload error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Đảm bảo không gửi response hai lần
      if (res.headersSent) {
        return;
      }
      
      return res.status(400).json({
        success: false,
        message: 'Lỗi upload file: ' + (error.message || String(error))
      });
    }
    console.log('✅ Cloudinary upload success, file:', req.file);
    next();
  });
};

// Export các middleware khác nhau cho các use case
module.exports = {
  // Upload nâng cao với Cloudinary + Sharp
  uploadAvatarAdvanced: [uploadMemory.single('avatar'), resizeAvatar],
  
  // Upload Cloudinary trực tiếp với error handling
  uploadCloudinary: uploadCloudinaryWithError,
  
  // Upload local cơ bản (giữ nguyên)
  uploadLocal: multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
      }
    }
  }).single('avatar')
};