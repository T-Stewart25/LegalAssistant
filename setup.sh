#!/bin/bash

# Exit on error
set -e

echo "Setting up Legal Assistant Application..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install UI dependencies with clean installation
echo "Installing UI dependencies..."
cd UI
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json
echo "Installing dependencies including framer-motion..."
npm install
echo "Verifying framer-motion installation..."
if ! grep -q "framer-motion" package.json; then
  echo "Adding framer-motion dependency..."
  npm install framer-motion --save
fi
cd ..

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads

echo "Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "npm run dev"
echo ""
echo "Or to start them separately:"
echo "npm run dev:ui     # Frontend only"
echo "npm run dev:server # Backend only"
echo ""
echo "Note: If you encounter any build issues, try running:"
echo "cd UI && rm -rf node_modules package-lock.json && npm install && cd .."
