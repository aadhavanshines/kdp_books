# Sparrow in a container. Build from the project folder:
#   docker build -f deploy/Dockerfile -t sparrow .
FROM python:3.13-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends bubblewrap \
    && rm -rf /var/lib/apt/lists/*
RUN useradd --create-home sparrow

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sparrow ./sparrow

USER sparrow
ENV SPARROW_HOME=/home/sparrow/.sparrow
# Listen on all of the container's addresses, so Docker can forward the
# web chat; docker-run.sh publishes it on this computer's 127.0.0.1 only
ENV SPARROW_WEB_HOST=0.0.0.0
VOLUME /home/sparrow/.sparrow
EXPOSE 8765
CMD ["python", "-m", "sparrow", "run"]
