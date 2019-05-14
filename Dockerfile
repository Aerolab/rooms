FROM node:10
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
RUN npm ci

COPY . /usr/src/app/
RUN npm run build

CMD ["npm", "start"]
