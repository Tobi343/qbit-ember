# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# Runtime stage — nginx serves the static build and reverse-proxies /api/v2/
FROM nginx:alpine
COPY --from=build /app/dist/qbit-ember/browser /usr/share/nginx/html
# The official nginx image runs envsubst on /etc/nginx/templates/*.template at startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV QBIT_API_URL=http://gluetun:8090
EXPOSE 80
