# --- Etapa 1: Construcción (Build) ---
FROM node:18-alpine as build-stage

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar caché de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción (creará la carpeta /dist)
RUN npm run build

# --- Etapa 2: Servidor Web (Production) ---
FROM nginx:stable-alpine as production-stage

# Copiar el build de la etapa anterior a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]