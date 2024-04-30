FROM node:18.12.0
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g nodemon
RUN npm install
COPY . .
EXPOSE 3001
CMD [ "nodemon","--max-old-space-size=8192","server.js" ]
