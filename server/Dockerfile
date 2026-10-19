FROM node:22-alpine

WORKDIR /app

# Copy manifests with non-root ownership
COPY --chown=node:node package*.json ./

RUN npm ci || npm install --legacy-peer-deps

# Copy source code with non-root ownership
COPY --chown=node:node . .

RUN npm run build

# Switch to the non-root user for runtime execution
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]