FROM node:20-alpine

WORKDIR /app

ENV CONFIG_PATH=/config

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
