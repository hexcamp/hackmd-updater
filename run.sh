#! /bin/bash

docker run -it \
  --env-file=.env \
  -p 3000:3000 \
  ghcr.io/hexcamp/hackmd-updater

