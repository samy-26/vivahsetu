FROM node:20-alpine

RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/main"]
