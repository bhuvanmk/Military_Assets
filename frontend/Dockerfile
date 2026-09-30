# Multi-stage Dockerfile for React Frontend
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies with caching
COPY package*.json ./
RUN npm ci

# Copy source and build static bundle
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage using Nginx Alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets
COPY --from=build /app/dist .

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
