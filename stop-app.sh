#!/bin/bash

# Stop-app script for Legal Assistant application
# This script stops both the frontend and backend servers

echo "=== Stopping Legal Assistant Application ==="
echo "$(date)"

# Function to safely kill a process
kill_process() {
  local pid_file=$1
  local process_name=$2
  
  if [ -f "$pid_file" ]; then
    PID=$(cat "$pid_file")
    if ps -p $PID > /dev/null; then
      echo "Stopping $process_name (PID: $PID)..."
      kill $PID
      
      # Wait for the process to terminate
      for i in {1..5}; do
        if ! ps -p $PID > /dev/null; then
          echo "$process_name stopped successfully."
          break
        fi
        echo "Waiting for $process_name to terminate..."
        sleep 1
      done
      
      # Force kill if still running
      if ps -p $PID > /dev/null; then
        echo "$process_name is still running. Sending SIGKILL..."
        kill -9 $PID
        if ! ps -p $PID > /dev/null; then
          echo "$process_name forcefully terminated."
        else
          echo "Warning: Failed to terminate $process_name (PID: $PID)."
        fi
      fi
    else
      echo "$process_name (PID: $PID) is not running."
    fi
    rm -f "$pid_file"
  else
    echo "No PID file found for $process_name."
    
    # Try to find and kill the process by port
    if [ "$process_name" = "Backend server" ]; then
      PORT=3001
    elif [ "$process_name" = "Frontend server" ]; then
      PORT=5173
    else
      return
    fi
    
    # Find and kill process using the port
    if command -v lsof >/dev/null 2>&1; then
      PID=$(lsof -t -i:$PORT 2>/dev/null)
      if [ -n "$PID" ]; then
        echo "Found $process_name running on port $PORT (PID: $PID)."
        kill $PID
        echo "$process_name stopped."
      fi
    elif command -v netstat >/dev/null 2>&1 && command -v grep >/dev/null 2>&1 && command -v awk >/dev/null 2>&1; then
      # This is a more complex approach that might work on some systems
      PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)
      if [ -n "$PID" ]; then
        echo "Found $process_name running on port $PORT (PID: $PID)."
        kill $PID
        echo "$process_name stopped."
      fi
    fi
  fi
}

# Stop the frontend server
kill_process "logs/frontend.pid" "Frontend server"

# Stop the backend server
kill_process "logs/backend.pid" "Backend server"

# Check for any remaining Node.js processes related to our app
echo "Checking for any remaining processes..."

# Look for any remaining Vite or Node.js server processes
if command -v pgrep >/dev/null 2>&1; then
  # Find Vite preview processes
  VITE_PIDS=$(pgrep -f "vite preview" 2>/dev/null)
  if [ -n "$VITE_PIDS" ]; then
    echo "Found remaining Vite preview processes. Stopping them..."
    kill $VITE_PIDS 2>/dev/null
  fi
  
  # Find Node.js server processes
  NODE_PIDS=$(pgrep -f "node server/server.js" 2>/dev/null)
  if [ -n "$NODE_PIDS" ]; then
    echo "Found remaining Node.js server processes. Stopping them..."
    kill $NODE_PIDS 2>/dev/null
  fi
fi

echo ""
echo "=== Application Stopped ==="
echo "All services have been terminated."
echo "To start the application again, run: ./start-app.sh"
