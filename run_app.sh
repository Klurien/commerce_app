#!/bin/bash

# Commerce App Start Script
unset MONGO_URI

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    pkill -f "node server.js" 2>/dev/null
    exit
}

trap cleanup SIGINT

# Kill anything on port 5000 (backend) or 8081 (metro)
echo "Cleaning up existing processes..."
fuser -k 5000/tcp 2>/dev/null
fuser -k 8081/tcp 2>/dev/null


# Start MongoDB if using Docker
if [ -f "docker-compose.yml" ]; then
    echo "Starting local MongoDB..."
    docker compose up -d mongodb
fi

echo "Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!

echo "Waiting for backend to start..."
until curl -s http://localhost:5000/api/auth/me > /dev/null; do
  sleep 1
done
echo "Backend is UP."

echo "Starting Frontend Expo..."
cd ../frontend
npx expo start --clear

# Wait for background jobs
wait $BACKEND_PID

