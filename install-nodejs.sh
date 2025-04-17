#!/bin/bash

# Script to install Node.js and npm on a VM
# This script supports Ubuntu/Debian, CentOS/RHEL, and Alpine Linux

NODE_VERSION="18.x"  # LTS version

echo "=== Node.js Installation Script ==="
echo "This script will install Node.js $NODE_VERSION and npm on your system."
echo ""

# Function to detect the Linux distribution
detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
  elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
  elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS=$DISTRIB_ID
    VER=$DISTRIB_RELEASE
  elif [ -f /etc/debian_version ]; then
    OS="Debian"
    VER=$(cat /etc/debian_version)
  else
    OS=$(uname -s)
    VER=$(uname -r)
  fi
  
  echo "Detected OS: $OS $VER"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js on Ubuntu/Debian
install_nodejs_debian() {
  echo "Installing Node.js on Ubuntu/Debian..."
  
  # Check if curl is installed
  if ! command_exists curl; then
    echo "Installing curl..."
    sudo apt-get update
    sudo apt-get install -y curl
  fi
  
  # Add NodeSource repository
  echo "Adding NodeSource repository..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
  
  # Install Node.js
  echo "Installing Node.js and npm..."
  sudo apt-get install -y nodejs
  
  # Verify installation
  echo "Node.js version: $(node -v)"
  echo "npm version: $(npm -v)"
}

# Function to install Node.js on CentOS/RHEL
install_nodejs_centos() {
  echo "Installing Node.js on CentOS/RHEL..."
  
  # Check if curl is installed
  if ! command_exists curl; then
    echo "Installing curl..."
    sudo yum install -y curl
  fi
  
  # Add NodeSource repository
  echo "Adding NodeSource repository..."
  curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION} | sudo bash -
  
  # Install Node.js
  echo "Installing Node.js and npm..."
  sudo yum install -y nodejs
  
  # Verify installation
  echo "Node.js version: $(node -v)"
  echo "npm version: $(npm -v)"
}

# Function to install Node.js on Alpine Linux
install_nodejs_alpine() {
  echo "Installing Node.js on Alpine Linux..."
  
  # Update package index
  sudo apk update
  
  # Install Node.js and npm
  echo "Installing Node.js and npm..."
  sudo apk add nodejs npm
  
  # Verify installation
  echo "Node.js version: $(node -v)"
  echo "npm version: $(npm -v)"
}

# Function to install Node.js using NVM (Node Version Manager)
install_nodejs_nvm() {
  echo "Installing Node.js using NVM..."
  
  # Check if curl is installed
  if ! command_exists curl; then
    echo "curl is required for NVM installation. Please install curl first."
    exit 1
  fi
  
  # Install NVM
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  
  # Source NVM
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  
  # Install Node.js
  echo "Installing Node.js $NODE_VERSION..."
  nvm install ${NODE_VERSION}
  
  # Verify installation
  echo "Node.js version: $(node -v)"
  echo "npm version: $(npm -v)"
  
  # Add NVM to shell profile
  echo "Adding NVM to shell profile..."
  echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
  echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
  echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
  
  echo "Please restart your shell or run 'source ~/.bashrc' to use Node.js."
}

# Check if Node.js is already installed
if command_exists node && command_exists npm; then
  echo "Node.js $(node -v) and npm $(npm -v) are already installed."
  echo "Do you want to reinstall? (y/n)"
  read -r answer
  if [[ "$answer" != "y" ]]; then
    echo "Installation cancelled."
    exit 0
  fi
fi

# Detect the Linux distribution
detect_distro

# Install Node.js based on the detected distribution
case "$OS" in
  *Ubuntu*|*Debian*|*Mint*)
    install_nodejs_debian
    ;;
  *CentOS*|*Red*Hat*|*Fedora*)
    install_nodejs_centos
    ;;
  *Alpine*)
    install_nodejs_alpine
    ;;
  *)
    echo "Unsupported distribution: $OS"
    echo "Trying to install using NVM..."
    install_nodejs_nvm
    ;;
esac

echo ""
echo "=== Installation Complete ==="
echo "Node.js and npm have been installed successfully."
echo "You can now run the Legal Assistant application using ./start-app.sh"
