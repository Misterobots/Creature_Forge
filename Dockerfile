# Build Stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY package*.json ./
RUN npm install
COPY . .
# Pass build-time variables if needed, though mostly handled by client-side envs
RUN npm run build

# Production Stage
FROM nginx:alpine
# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
