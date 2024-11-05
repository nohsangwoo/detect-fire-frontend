FROM node:20.11.1

WORKDIR /usr/src/app

RUN npm install -g pm2

COPY . .

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# build.sh에서 전달받은 변수를 ARG로 주입
ARG NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_CLOUD_FRONT_DOMAIN=${NEXT_PUBLIC_CLOUD_FRONT_DOMAIN}
ARG NEXT_PUBLIC_S3_DOMAIN=${NEXT_PUBLIC_S3_DOMAIN}

# ARG를 ENV로 설정 (수정된 부분)
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CLOUD_FRONT_DOMAIN=${NEXT_PUBLIC_CLOUD_FRONT_DOMAIN}
ENV NEXT_PUBLIC_S3_DOMAIN=${NEXT_PUBLIC_S3_DOMAIN}

RUN npm cache clean --force
RUN npm install --legacy-peer-deps --timeout=600000
RUN npm run build

RUN apt-get update && apt-get install -y ffmpeg inetutils-ping dnsutils vim

EXPOSE 3000


CMD ["bash", "-c", "pm2-runtime start ecosystem.config.js --env production"]

