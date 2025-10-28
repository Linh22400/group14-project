const mongoose = require('mongoose');

// RefreshToken Schema để lưu trữ refresh tokens
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Refresh token là bắt buộc'],
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Thời gian hết hạn là bắt buộc'],
    index: { expireAfterSeconds: 0 } // TTL index để tự động xóa token hết hạn
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo compound index để tìm kiếm nhanh theo user và token
refreshTokenSchema.index({ userId: 1, token: 1 });

// Method để kiểm tra token còn hạn không
refreshTokenSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method để kiểm tra token có bị thu hồi không
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && !this.isExpired();
};

// Static method để cleanup các token cũ
refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isRevoked: true }
    ]
  });
  return result.deletedCount;
};

// Static method để revoke tất cả tokens của một user
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId) {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true, updatedAt: new Date() }
  );
  return result.modifiedCount;
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;