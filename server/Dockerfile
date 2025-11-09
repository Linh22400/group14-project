# Sử dụng Node.js 18
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json
COPY server/package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Copy toàn bộ code server
COPY server/ ./

# Tạo thư mục uploads nếu chưa có
RUN mkdir -p uploads

# Mở port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Chạy ứng dụng
CMD ["npm", "start"]