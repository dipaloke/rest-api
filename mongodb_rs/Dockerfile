ARG MONGO_VERSION=7
FROM mongo:${MONGO_VERSION}

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Environment defaults
ENV MONGO_REPLICA_HOST=localhost \
    MONGO_REPLICA_PORT=27017

EXPOSE 27017
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
