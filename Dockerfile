FROM nginx:alpine

LABEL maintainer="Shinei Nouzen"
LABEL description="AniBili - Free Anime Streaming App"

COPY public /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
