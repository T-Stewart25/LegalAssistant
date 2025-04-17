#!/bin/bash

# Script to install Legal Assistant as a systemd service
# This script must be run with sudo privileges

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

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  print_message "$RED" "Error: This script must be run with sudo privileges."
  print_message "$YELLOW" "Please run: sudo $0"
  exit 1
fi

# Get the current directory
CURRENT_DIR=$(pwd)

# Get the current user (the user who ran sudo)
ACTUAL_USER=$(logname || echo $SUDO_USER)

print_message "$GREEN" "=== Installing Legal Assistant as a Systemd Service ==="
print_message "$GREEN" "Current directory: $CURRENT_DIR"
print_message "$GREEN" "User: $ACTUAL_USER"
echo ""

# Check if the service file exists
if [ ! -f "$CURRENT_DIR/legal-assistant.service" ]; then
  print_message "$RED" "Error: legal-assistant.service file not found in the current directory."
  exit 1
fi

# Check if start-app.sh and stop-app.sh exist
if [ ! -f "$CURRENT_DIR/start-app.sh" ] || [ ! -f "$CURRENT_DIR/stop-app.sh" ]; then
  print_message "$RED" "Error: start-app.sh or stop-app.sh not found in the current directory."
  exit 1
fi

# Make sure the scripts are executable
print_message "$YELLOW" "Making scripts executable..."
chmod +x "$CURRENT_DIR/start-app.sh" "$CURRENT_DIR/stop-app.sh"

# Update the service file with the correct paths and user
print_message "$YELLOW" "Updating service file with correct paths and user..."
sed -i "s|User=ubuntu|User=$ACTUAL_USER|g" "$CURRENT_DIR/legal-assistant.service"
sed -i "s|WorkingDirectory=/home/ubuntu/LegalAssistant|WorkingDirectory=$CURRENT_DIR|g" "$CURRENT_DIR/legal-assistant.service"
sed -i "s|ExecStart=/home/ubuntu/LegalAssistant/start-app.sh|ExecStart=$CURRENT_DIR/start-app.sh|g" "$CURRENT_DIR/legal-assistant.service"
sed -i "s|ExecStop=/home/ubuntu/LegalAssistant/stop-app.sh|ExecStop=$CURRENT_DIR/stop-app.sh|g" "$CURRENT_DIR/legal-assistant.service"

# Copy the service file to the systemd directory
print_message "$YELLOW" "Copying service file to /etc/systemd/system/..."
cp "$CURRENT_DIR/legal-assistant.service" /etc/systemd/system/

# Set the correct permissions
print_message "$YELLOW" "Setting correct permissions..."
chmod 644 /etc/systemd/system/legal-assistant.service

# Reload systemd configuration
print_message "$YELLOW" "Reloading systemd configuration..."
systemctl daemon-reload

# Enable the service
print_message "$YELLOW" "Enabling the service to start on boot..."
systemctl enable legal-assistant

# Ask if the user wants to start the service now
echo ""
read -p "Do you want to start the service now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  print_message "$YELLOW" "Starting the service..."
  systemctl start legal-assistant
  
  # Check if the service started successfully
  if systemctl is-active --quiet legal-assistant; then
    print_message "$GREEN" "Service started successfully!"
  else
    print_message "$RED" "Service failed to start. Check the logs with: sudo journalctl -u legal-assistant -n 50"
  fi
else
  print_message "$YELLOW" "Service not started. You can start it later with: sudo systemctl start legal-assistant"
fi

# Display service status
echo ""
print_message "$YELLOW" "Service status:"
systemctl status legal-assistant

echo ""
print_message "$GREEN" "=== Installation Complete ==="
print_message "$GREEN" "Your Legal Assistant application is now set up as a systemd service."
print_message "$GREEN" "It will start automatically when the server boots and restart if it crashes."
print_message "$YELLOW" "You can manage the service with the following commands:"
echo "  - Check status: sudo systemctl status legal-assistant"
echo "  - View logs: sudo journalctl -u legal-assistant"
echo "  - Restart: sudo systemctl restart legal-assistant"
echo "  - Stop: sudo systemctl stop legal-assistant"
echo ""
print_message "$GREEN" "For more information, see the SYSTEMD_SETUP_GUIDE.md file."
