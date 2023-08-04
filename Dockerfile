# Sử dụng hình ảnh chính thức Node.js
FROM node:14

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json (hoặc yarn.lock) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Copy tất cả mã nguồn vào container
COPY . .

# Khởi chạy ứng dụng Node.js
CMD ["npm", "start"]
