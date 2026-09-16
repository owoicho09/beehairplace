FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm install --no-save typescript && npx tsc && npm uninstall typescript

EXPOSE 8787
CMD ["node", "dist/index.js"]
