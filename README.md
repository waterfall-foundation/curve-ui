# Curve Finance

## Build container 

`docker build -t crv -f Dockerfile-production .`

## Rub container in detached mode

`docker run --name curve -it -d crv`

## Copy static files from container

`docker cp curve:/app/dist $(pwd)/dist`

## Stop and delete container

`docker stop curve`
`docker rm curve`
