#!/bin/bash

# Start-app script for Legal Assistant application
# This script builds and starts both the frontend and backend

# Set default ports and host
BACKEND_PORT=3001
FRONTEND_PORT=5173
HOST="0.0.0.0"  # Bind to all network interfaces to allow external access

# Create a log directory if it doesn't exist
mkdir -p logs

echo "=== Legal Assistant Application Startup ==="
echo "$(date)"
echo "Starting on host: $HOST"
echo "Backend port: $BACKEND_PORT"
echo "Frontend port: $FRONTEND_PORT"
echo ""

# Function to check if a port is in use
is_port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -i:"$1" >/dev/null 2>&1
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep ":$1 " >/dev/null 2>&1
    return $?
  else
    echo "Warning: Cannot check if port $1 is in use (lsof or netstat not available)"
    return 1
  fi
}

# Check if ports are already in use
if is_port_in_use $BACKEND_PORT; then
  echo "Error: Port $BACKEND_PORT is already in use. Backend may already be running."
  echo "Use './stop-app.sh' to stop any running instances first."
  exit 1
fi

if is_port_in_use $FRONTEND_PORT; then
  echo "Error: Port $FRONTEND_PORT is already in use. Frontend may already be running."
  echo "Use './stop-app.sh' to stop any running instances first."
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "UI/node_modules" ] || [ ! -d "server/node_modules" ]; then
  echo "Installing dependencies..."
  npm run install-all
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Set environment variables for the server
export NODE_ENV=production
export PORT=$BACKEND_PORT

# Start the backend server in the background
echo "Starting backend server on port $BACKEND_PORT..."
node server/server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid
echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for the server to start
sleep 2

# Check if the server started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Error: Backend server failed to start. Check logs/backend.log for details."
  exit 1
fi

# Serve the frontend using a simple HTTP server
echo "Starting frontend server on port $FRONTEND_PORT..."
if command -v npx >/dev/null 2>&1; then
  # Use Vite's preview server to serve the built frontend
  cd UI && npx vite preview --host $HOST --port $FRONTEND_PORT > ../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
else
  # Fallback to a simple HTTP server if npx is not available
  if command -v python3 >/dev/null 2>&1; then
    cd UI/dist && python3 -m http.server $FRONTEND_PORT --bind $HOST > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
  elif command -v python >/dev/null 2>&1; then
    cd UI/dist && python -m SimpleHTTPServer $FRONTEND_PORT > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
  else
    echo "Error: Cannot start frontend server. Please install Node.js with npx or Python."
    kill $BACKEND_PID
    exit 1
  fi
fi

echo $FRONTEND_PID > logs/frontend.pid
echo "Frontend server started with PID: $FRONTEND_PID"

# Get the server's IP address
if command -v hostname >/dev/null 2>&1; then
  IP_ADDRESS=$(hostname -I | awk '{print $1}')
elif command -v ip >/dev/null 2>&1; then
  IP_ADDRESS=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n 1)
else
  IP_ADDRESS="your-server-ip"
fi

# Display access information
echo ""
echo "=== Application Started Successfully ==="
echo "Backend API: http://$IP_ADDRESS:$BACKEND_PORT/api"
echo "Frontend: http://$IP_ADDRESS:$FRONTEND_PORT"
echo ""
echo "Health check: http://$IP_ADDRESS:$BACKEND_PORT/api/health"
echo ""
echo "Log files:"
echo "- Backend: logs/backend.log"
echo "- Frontend: logs/frontend.log"
echo ""
echo "To stop the application, run: ./stop-app.sh"
echo "Or press Ctrl+C to stop this script (will keep servers running in background)"
echo "==================================="

# Keep the script running to make it easier to stop with Ctrl+C
trap "echo 'Stopping application...'; ./stop-app.sh; exit 0" INT TERM
while true; do
  sleep 1
done
