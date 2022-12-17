# Stage 1: Compile and Build angular codebase
FROM node:alpine as build
RUN npm install -g @angular/cli

WORKDIR /usr/local/app
COPY ./ /usr/local/app/

RUN npm install
RUN ng build -c production --base-href=/replacemebasehref/

# Stage 2: Serve app with nginx server
FROM nginx:latest

COPY --from=build /usr/local/app/dist/frontend-angular /etc/nginx/html

COPY ./nginx-conf/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-conf/*.sh /docker-entrypoint.d

# Expose port 80
EXPOSE 80
ENV APP_BASE_HREF="/replacemebasehref"
ENV TARGET_BASE_PATH=""