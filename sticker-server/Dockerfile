FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json ./
RUN npm install --production

# 复制代码
COPY server.js ./

# 创建数据目录
RUN mkdir -p /data/stickers

# 暴露端口
EXPOSE 3001

# 启动服务
CMD ["node", "server.js"]
