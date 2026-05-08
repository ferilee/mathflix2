# Build Stage
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production Stage
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY config.template.js /usr/share/nginx/html/config.template.js

# Make startup script executable
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 80

ENTRYPOINT ["/startup.sh"]
CMD ["nginx", "-g", "daemon off;"]
