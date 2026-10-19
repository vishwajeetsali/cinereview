# ── Stage 1: Build the React Application ──────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Cache dependency layer
COPY package*.json ./
RUN npm ci

# Pass the backend URL to Vite at build time
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Copy source code and compile
COPY . .
RUN npm run build

# ── Stage 2: Serve with High-Performance Nginx ────────────
FROM nginx:alpine

# Copy the SPA Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the static dist output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]