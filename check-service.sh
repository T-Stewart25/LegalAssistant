#!/bin/bash

# Script to check if the Legal Assistant service is running correctly
# This script can be run without sudo privileges

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

print_message "$GREEN" "=== Legal Assistant Service Check ==="
echo ""

# Check if the service is installed
if ! systemctl list-unit-files | grep -q legal-assistant.service; then
  print_message "$RED" "Error: The legal-assistant service is not installed."
  print_message "$YELLOW" "Please run: sudo ./install-service.sh"
  exit 1
fi

# Check if the service is enabled
if systemctl is-enabled --quiet legal-assistant; then
  print_message "$GREEN" "✅ Service is enabled to start on boot"
else
  print_message "$YELLOW" "⚠️ Service is not enabled to start on boot"
  print_message "$YELLOW" "   Run: sudo systemctl enable legal-assistant"
fi

# Check if the service is active
if systemctl is-active --quiet legal-assistant; then
  print_message "$GREEN" "✅ Service is active and running"
else
  print_message "$RED" "❌ Service is not running"
  print_message "$YELLOW" "   Run: sudo systemctl start legal-assistant"
  print_message "$YELLOW" "   Check logs: sudo journalctl -u legal-assistant -n 50"
  exit 1
fi

# Get service status details
echo ""
print_message "$YELLOW" "Service Status Details:"
systemctl status legal-assistant | grep -v "^$"

# Check if the backend is responding
echo ""
print_message "$YELLOW" "Checking Backend API..."
BACKEND_PORT=3001
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/health 2>/dev/null)
  
  if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
    print_message "$GREEN" "✅ Backend API is responding (HTTP $HTTP_STATUS)"
    
    # Get the response body
    RESPONSE=$(curl -s http://localhost:$BACKEND_PORT/api/health)
    echo "   Response: $RESPONSE"
  else
    print_message "$RED" "❌ Backend API is not responding correctly (HTTP $HTTP_STATUS)"
    print_message "$YELLOW" "   Check logs: sudo journalctl -u legal-assistant -n 50"
  fi
else
  print_message "$YELLOW" "⚠️ curl is not installed. Cannot check backend API."
  print_message "$YELLOW" "   Install curl: sudo apt-get install curl"
fi

# Check if the frontend is responding
echo ""
print_message "$YELLOW" "Checking Frontend..."
FRONTEND_PORT=5173
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT 2>/dev/null)
  
  if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
    print_message "$GREEN" "✅ Frontend is responding (HTTP $HTTP_STATUS)"
  else
    print_message "$RED" "❌ Frontend is not responding correctly (HTTP $HTTP_STATUS)"
    print_message "$YELLOW" "   Check logs: sudo journalctl -u legal-assistant -n 50"
  fi
else
  print_message "$YELLOW" "⚠️ curl is not installed. Cannot check frontend."
  print_message "$YELLOW" "   Install curl: sudo apt-get install curl"
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
print_message "$GREEN" "=== Access Information ==="
echo "Backend API: http://$IP_ADDRESS:$BACKEND_PORT/api"
echo "Frontend: http://$IP_ADDRESS:$FRONTEND_PORT"
echo "Health Check: http://$IP_ADDRESS:$BACKEND_PORT/api/health"

echo ""
print_message "$GREEN" "=== Check Complete ==="
