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

# Check for Node.js and npm installation
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not in PATH"
  echo "Please install Node.js (v18.0.0 or higher) before running this script."
  echo "Visit https://nodejs.org/en/download/ for installation instructions."
  exit 1
fi

echo "Node.js version: $(node -v)"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH"
  echo "npm is required to run this application."
  echo "It should be included with Node.js installation."
  exit 1
fi

echo "npm version: $(npm -v)"
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
  
  # Check if installation was successful
  if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies."
    echo "Trying to install dependencies individually..."
    
    # Try to install dependencies individually
    echo "Installing root dependencies..."
    npm install
    
    echo "Installing UI dependencies..."
    cd UI && npm install && cd ..
    
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
    
    # Check if any of the node_modules directories exist now
    if [ ! -d "node_modules" ] || [ ! -d "UI/node_modules" ] || [ ! -d "server/node_modules" ]; then
      echo "Error: Failed to install dependencies. Please install them manually."
      exit 1
    fi
  fi
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to build the frontend."
  echo "Trying to build directly..."
  
  cd UI && npm run build && cd ..
  
  # Check if the build directory exists
  if [ ! -d "UI/dist" ]; then
    echo "Error: Failed to build the frontend. Please build it manually."
    echo "You can try: cd UI && npm run build"
    exit 1
  fi
fi

# Set environment variables for the server
export NODE_ENV=production
export PORT=$BACKEND_PORT

# Function to display logs
display_log() {
  local log_file=$1
  local lines=${2:-20}
  
  if [ -f "$log_file" ]; then
    echo "Last $lines lines of $log_file:"
    tail -n $lines "$log_file"
  else
    echo "Log file $log_file not found."
  fi
}

# Start the backend server in the background
echo "Starting backend server on port $BACKEND_PORT..."

# Check if server.js exists
if [ ! -f "server/server.js" ]; then
  echo "Error: server/server.js not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if required modules are installed
if [ ! -d "server/node_modules" ]; then
  echo "Error: server/node_modules directory not found. Installing server dependencies..."
  cd server && npm install && cd ..
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to install server dependencies."
    exit 1
  fi
fi

# Start the server with detailed error handling
node server/server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid
echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for the server to start
echo "Waiting for backend server to initialize..."
sleep 5

# Check if the server started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Error: Backend server failed to start."
  echo "Displaying backend logs for troubleshooting:"
  display_log "logs/backend.log" 50
  echo ""
  echo "Possible issues:"
  echo "1. Missing dependencies - Try running 'cd server && npm install'"
  echo "2. Port conflict - Make sure port $BACKEND_PORT is not in use"
  echo "3. Configuration issues - Check server/.env file"
  echo ""
  exit 1
fi

# Verify the server is responding
if command -v curl >/dev/null 2>&1; then
  echo "Testing backend server..."
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/health 2>/dev/null)
  
  if [ "$HTTP_STATUS" -lt 200 ] || [ "$HTTP_STATUS" -ge 400 ]; then
    echo "Warning: Backend server is running but not responding correctly (HTTP $HTTP_STATUS)."
    echo "The server may still be starting up or may have configuration issues."
    echo "Continuing startup process, but you may need to check the logs if problems persist."
  else
    echo "Backend server is responding correctly (HTTP $HTTP_STATUS)."
  fi
fi

# Check if the frontend build directory exists
if [ ! -d "UI/dist" ]; then
  echo "Error: UI/dist directory not found. The frontend may not have been built correctly."
  echo "Stopping backend server..."
  kill $BACKEND_PID
  exit 1
fi

# Serve the frontend using a simple HTTP server
echo "Starting frontend server on port $FRONTEND_PORT..."

# Try different methods to serve the frontend
FRONTEND_SERVER_STARTED=false

# Method 1: Use Vite's preview server
if command -v npx >/dev/null 2>&1 && [ "$FRONTEND_SERVER_STARTED" = false ]; then
  echo "Trying to start frontend using Vite preview..."
  cd UI && npx vite preview --host $HOST --port $FRONTEND_PORT > ../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
  
  # Wait a moment for the server to start
  sleep 3
  
  # Check if the server started successfully
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "Frontend server started with Vite preview (PID: $FRONTEND_PID)"
    FRONTEND_SERVER_STARTED=true
  else
    echo "Failed to start frontend with Vite preview."
  fi
fi

# Method 2: Use Python 3's HTTP server
if command -v python3 >/dev/null 2>&1 && [ "$FRONTEND_SERVER_STARTED" = false ]; then
  echo "Trying to start frontend using Python 3 HTTP server..."
  cd UI/dist && python3 -m http.server $FRONTEND_PORT --bind $HOST > ../../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ../..
  
  # Wait a moment for the server to start
  sleep 3
  
  # Check if the server started successfully
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "Frontend server started with Python 3 HTTP server (PID: $FRONTEND_PID)"
    FRONTEND_SERVER_STARTED=true
  else
    echo "Failed to start frontend with Python 3 HTTP server."
  fi
fi

# Method 3: Use Python 2's SimpleHTTPServer
if command -v python >/dev/null 2>&1 && [ "$FRONTEND_SERVER_STARTED" = false ]; then
  echo "Trying to start frontend using Python 2 SimpleHTTPServer..."
  cd UI/dist && python -m SimpleHTTPServer $FRONTEND_PORT > ../../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ../..
  
  # Wait a moment for the server to start
  sleep 3
  
  # Check if the server started successfully
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "Frontend server started with Python 2 SimpleHTTPServer (PID: $FRONTEND_PID)"
    FRONTEND_SERVER_STARTED=true
  else
    echo "Failed to start frontend with Python 2 SimpleHTTPServer."
  fi
fi

# Method 4: Use Node.js http-server if available
if command -v npx >/dev/null 2>&1 && [ "$FRONTEND_SERVER_STARTED" = false ]; then
  echo "Trying to start frontend using npx http-server..."
  cd UI/dist && npx http-server -p $FRONTEND_PORT --cors -a $HOST > ../../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ../..
  
  # Wait a moment for the server to start
  sleep 3
  
  # Check if the server started successfully
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "Frontend server started with http-server (PID: $FRONTEND_PID)"
    FRONTEND_SERVER_STARTED=true
  else
    echo "Failed to start frontend with http-server."
  fi
fi

# Check if any method succeeded
if [ "$FRONTEND_SERVER_STARTED" = false ]; then
  echo "Error: Failed to start frontend server using any available method."
  echo "Please install Node.js with npx or Python to serve the frontend."
  echo "Stopping backend server..."
  kill $BACKEND_PID
  exit 1
fi

# Save the PID for later
echo $FRONTEND_PID > logs/frontend.pid

# Verify the frontend server is responding
if command -v curl >/dev/null 2>&1; then
  echo "Testing frontend server..."
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT 2>/dev/null)
  
  if [ "$HTTP_STATUS" -lt 200 ] || [ "$HTTP_STATUS" -ge 400 ]; then
    echo "Warning: Frontend server is running but not responding correctly (HTTP $HTTP_STATUS)."
    echo "The server may still be starting up or may have configuration issues."
    echo "Continuing startup process, but you may need to check the logs if problems persist."
  else
    echo "Frontend server is responding correctly (HTTP $HTTP_STATUS)."
  fi
fi

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
