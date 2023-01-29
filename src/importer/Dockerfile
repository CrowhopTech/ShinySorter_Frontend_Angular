FROM node:alpine

RUN ["apk", "add", "--no-cache", "ffmpeg", "python3", "make", "gcc", "py3-magic", "lua-file-magic", "perl-file-mmagic", "libc-dev", "build-base"]

COPY . .
WORKDIR /app

RUN ["npm", "install", "--save-dev"]

CMD ["npm", "run", "prod"]