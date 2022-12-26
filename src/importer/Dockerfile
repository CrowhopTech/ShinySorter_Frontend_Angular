FROM node:alpine
RUN ["apk", "add", "--no-cache", "ffmpeg"]

COPY . .
WORKDIR /app

RUN ["npm", "install", "--save-dev"]

CMD ["npm", "run", "prod"]