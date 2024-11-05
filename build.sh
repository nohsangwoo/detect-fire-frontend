#!/bin/bash

rm -rf .next/
rm -rf dist/

# 이전에 실행중인 컨테이너 중지
docker stop ludgi-fire

# 이전에 실행중인 컨테이너 삭제
docker rm ludgi-fire

# 이전에 저장된 이미지 삭제
docker rmi nsgr12/ludgi:fire

#
# .env.production 파일에서 환경 변수를 읽어와서 --build-arg 옵션 생성
BUILD_ARGS=$(grep -v '^#' .env.production | xargs -I {} echo --build-arg {} | tr '\n' ' ')

# Dockerfile 내용을 동적으로 생성
cat >Dockerfile <<EOF
FROM node:20.11.1

WORKDIR /usr/src/app

RUN npm install -g pm2

COPY . .

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# build.sh에서 전달받은 변수를 ARG로 주입
$(grep -v '^#' .env.production | grep -v '^\s*$' | sed 's/^\([^=]*\)=.*$/ARG \1=${\1}/')

# ARG를 ENV로 설정 (수정된 부분)
$(grep -v '^#' .env.production | grep -v '^\s*$' | sed 's/^\([^=]*\)=.*$/ENV \1=${\1}/')

RUN npm cache clean --force
RUN npm install --legacy-peer-deps --timeout=600000
RUN npm run build

RUN apt-get update && apt-get install -y ffmpeg inetutils-ping dnsutils vim

EXPOSE 3000


CMD ["bash", "-c", "pm2-runtime start ecosystem.config.js --env production"]

EOF

# 이미지 빌드
docker build $BUILD_ARGS -t nsgr12/ludgi:fire --no-cache .

docker run --restart=always -d -p 7999:3000 --network mynetwork --name ludgi-fire nsgr12/ludgi:fire
