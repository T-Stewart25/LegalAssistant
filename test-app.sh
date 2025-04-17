#!/bin/bash

# Test script for Legal Assistant application
# This script checks if the application is running correctly

echo "=== Legal Assistant Application Test ==="
echo "$(date)"
echo ""

# Function to check if a port is in use
is_port_in_use() {
  if command -v curl >/dev/null 2>&1; then
    curl -s -o /dev/null -w "%{http_code}" http://localhost:$1 >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      return 0
    else
      return 1
    fi
  elif command -v lsof >/dev/null 2>&1; then
    lsof -i:"$1" >/dev/null 2>&1
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep ":$1 " >/dev/null 2>&1
    return $?
  else
    echo "Warning: Cannot check if port $1 is in use (curl, lsof, or netstat not available)"
    return 1
  fi
}

# Function to test an endpoint
test_endpoint() {
  local url=$1
  local description=$2
  
  echo "Testing $description: $url"
  
  if command -v curl >/dev/null 2>&1; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null)
    if [ $? -eq 0 ] && [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
      echo "✅ Success: $description is accessible (HTTP $HTTP_STATUS)"
      return 0
    else
      echo "❌ Failed: $description returned HTTP $HTTP_STATUS or is not accessible"
      return 1
    fi
  else
    echo "❌ Failed: curl is not installed. Cannot test $description."
    return 1
  fi
}

# Get the server's IP address
if command -v hostname >/dev/null 2>&1; then
  IP_ADDRESS=$(hostname -I | awk '{print $1}')
elif command -v ip >/dev/null 2>&1; then
  IP_ADDRESS=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n 1)
else
  IP_ADDRESS="localhost"
  echo "Warning: Could not determine server IP address. Using 'localhost' instead."
fi

# Check if the backend server is running
BACKEND_PORT=3001
if is_port_in_use $BACKEND_PORT; then
  echo "✅ Backend server is running on port $BACKEND_PORT"
  
  # Test the health endpoint
  test_endpoint "http://$IP_ADDRESS:$BACKEND_PORT/api/health" "Backend health endpoint"
  
  # Test the chat API
  test_endpoint "http://$IP_ADDRESS:$BACKEND_PORT/api/chat" "Chat API"
  
  # Test the files API
  test_endpoint "http://$IP_ADDRESS:$BACKEND_PORT/api/files" "Files API"
else
  echo "❌ Backend server is not running on port $BACKEND_PORT"
fi

# Check if the frontend server is running
FRONTEND_PORT=5173
if is_port_in_use $FRONTEND_PORT; then
  echo "✅ Frontend server is running on port $FRONTEND_PORT"
  
  # Test the frontend
  test_endpoint "http://$IP_ADDRESS:$FRONTEND_PORT" "Frontend application"
else
  echo "❌ Frontend server is not running on port $FRONTEND_PORT"
fi

# Check for PID files
echo ""
echo "Checking PID files:"
if [ -f "logs/backend.pid" ]; then
  BACKEND_PID=$(cat logs/backend.pid)
  if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server process is running (PID: $BACKEND_PID)"
  else
    echo "❌ Backend server process is not running, but PID file exists"
  fi
else
  echo "❌ Backend server PID file not found"
fi

if [ -f "logs/frontend.pid" ]; then
  FRONTEND_PID=$(cat logs/frontend.pid)
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server process is running (PID: $FRONTEND_PID)"
  else
    echo "❌ Frontend server process is not running, but PID file exists"
  fi
else
  echo "❌ Frontend server PID file not found"
fi

# Check log files
echo ""
echo "Checking log files:"
if [ -f "logs/backend.log" ]; then
  echo "✅ Backend log file exists"
  echo "Last 5 lines of backend.log:"
  tail -n 5 logs/backend.log
else
  echo "❌ Backend log file not found"
fi

if [ -f "logs/frontend.log" ]; then
  echo "✅ Frontend log file exists"
  echo "Last 5 lines of frontend.log:"
  tail -n 5 logs/frontend.log
else
  echo "❌ Frontend log file not found"
fi

echo ""
echo "=== Test Complete ==="
echo "Access your application at:"
echo "- Frontend: http://$IP_ADDRESS:$FRONTEND_PORT"
echo "- Backend API: http://$IP_ADDRESS:$BACKEND_PORT/api"
echo "- Health Check: http://$IP_ADDRESS:$BACKEND_PORT/api/health"
