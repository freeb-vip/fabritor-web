# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (use yarn since repository includes yarn.lock)
COPY package.json yarn.lock ./
RUN apk add --no-cache python3 make g++ && \
    yarn install --frozen-lockfile && \
    apk del python3 make g++ || true

# Copy sources and build
COPY . .
RUN yarn build

# Production stage - serve build with nginx
FROM nginx:stable-alpine

# Remove default nginx static
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
