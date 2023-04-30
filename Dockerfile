FROM node:18-alpine as buildnode

WORKDIR /apps/echo-request-body

COPY . .
RUN yarn
RUN yarn build

# Distroless for smaller sized containers
FROM node:18-alpine

WORKDIR /apps/echo-request-body

COPY --from=buildnode /apps/echo-request-body/node_modules /apps/echo-request-body/node_modules
COPY --from=buildnode /apps/echo-request-body/build /apps/echo-request-body/build
COPY --from=buildnode /apps/echo-request-body/package.json /apps/echo-request-body/.
COPY server.js /apps/echo-request-body/.

CMD ["node", "server.js"]




