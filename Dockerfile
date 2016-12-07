FROM mhart/alpine-node

ADD ./ /app

RUN cd /app && npm i && npm run build && npm i --production

CMD cd /app && npm start
