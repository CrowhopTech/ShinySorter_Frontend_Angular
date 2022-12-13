FROM node:16.16.0

COPY . .
WORKDIR /app

RUN ["npm", "install", "--save-dev"]
RUN ["npm", "install", "--save-dev", "@types/pg"]

EXPOSE 6060

CMD ["npm", "run", "prod"]