# Imagen ligera de producción
FROM node:22-alpine

WORKDIR /app

# Instala solo dependencias de producción aprovechando la caché de capas
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código fuente
COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
