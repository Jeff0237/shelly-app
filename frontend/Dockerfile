FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm install

COPY . .

# Set default port
ENV VITE_PORT=3000

# Expose the port
EXPOSE ${VITE_PORT}

# Use development mode with host flag for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 
