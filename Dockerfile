FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

##se instala lo necesario para encriptar y hacer el uso de autenticacion
RUN npm install bcrypt
RUN npm install express-session connect-pg-simple

COPY . .

EXPOSE 3000
CMD ["npm","run","dev"]
