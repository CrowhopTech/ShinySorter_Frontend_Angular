FROM node:alpine

COPY . .
WORKDIR /app

RUN ["npm", "install", "--save-dev"]
RUN ["npm", "install", "--save-dev", "@types/pg"]

EXPOSE 6060

CMD ["npm", "run", "prod"]