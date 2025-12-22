# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_BASE_WS_URL
ARG VITE_S3_URL
ARG VITE_S3_ENDPOINT
ARG VITE_S3_BUCKET_NAME
ARG VITE_AWS_ACCESS_KEY_ID
ARG VITE_AWS_SECRET_ACCESS_KEY
ARG VITE_ATTACHMENT_BASE_URL
ARG VITE_REFRESH_INTERVAL

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE_WS_URL=$VITE_API_BASE_WS_URL
ENV VITE_S3_URL=$VITE_S3_URL
ENV VITE_S3_ENDPOINT=$VITE_S3_ENDPOINT
ENV VITE_S3_BUCKET_NAME=$VITE_S3_BUCKET_NAME
ENV VITE_AWS_ACCESS_KEY_ID=$VITE_AWS_ACCESS_KEY_ID
ENV VITE_AWS_SECRET_ACCESS_KEY=$VITE_AWS_SECRET_ACCESS_KEY
ENV VITE_ATTACHMENT_BASE_URL=$VITE_ATTACHMENT_BASE_URL
ENV VITE_REFRESH_INTERVAL=$VITE_REFRESH_INTERVAL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

