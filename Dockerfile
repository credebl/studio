FROM node:lts as build

# Install Deno
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno

WORKDIR /app
RUN deno --version
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2
FROM node:lts as prod

# Install Deno
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD [ "npm", "run", "preview" ]