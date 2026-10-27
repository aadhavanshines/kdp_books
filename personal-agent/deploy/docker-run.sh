#!/bin/sh
# Run Sparrow in Docker. The two --security-opt settings let bubblewrap
# create its sandbox inside the container (Chapter 25 explains the
# trade-off); without them Sparrow refuses to run commands.
# The web chat is published on this computer only (127.0.0.1).
docker run -d --name sparrow --restart unless-stopped \
  --security-opt seccomp=unconfined \
  --security-opt systempaths=unconfined \
  --env-file "$HOME/.sparrow/state/model.env" \
  -v "$HOME/.sparrow:/home/sparrow/.sparrow" \
  -p 127.0.0.1:8765:8765 \
  sparrow
