FROM node:24-alpine

RUN apk -U upgrade
RUN apk add --no-cache git

WORKDIR /work

COPY . .

RUN npm install
RUN npm run build:ts
RUN git config --global user.email robot@hex.camp
RUN git config --global user.name hackmd-updater

EXPOSE 3000

ENTRYPOINT ["npx", "fastify", "start", "-l", "info", "dist/app.js"]
