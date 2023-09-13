# Sous Vide Server

## Install
```
podman build -t sousvideserver .
podman run --rm -it -p 8080:8080 -v ./app:/code/app:z -v ./data:/data:z --env DEBUG=1 sousvideserver
```
