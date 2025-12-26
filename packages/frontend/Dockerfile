FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies and build frontend
COPY package.json ./
COPY index.html ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY components.json ./
COPY eslint.config.js ./
COPY public ./public
COPY src ./src
RUN npm install
RUN npm run build

# Runtime with Nginx serving static and proxying /api to backend
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
