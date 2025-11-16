#!/usr/bin/env bash
set -euo pipefail

: "${MONGO_REPLICA_HOST:=localhost}"
: "${MONGO_REPLICA_PORT:=27017}"

# Start MongoDB in replica set mode
mongod --port "$MONGO_REPLICA_PORT" --replSet rs0 --bind_ip_all &
MONGOD_PID=$!

# Initialize replica set
INIT_REPL_CMD="rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '${MONGO_REPLICA_HOST}:${MONGO_REPLICA_PORT}' }] })"

until mongosh --port "$MONGO_REPLICA_PORT" --quiet --eval "$INIT_REPL_CMD" >/dev/null 2>&1; do
  echo "Waiting for mongod to be ready..."
  sleep 1
done

echo "Replica set rs0 initialized."
wait "$MONGOD_PID"
