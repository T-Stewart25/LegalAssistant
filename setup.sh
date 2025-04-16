#!/bin/bash

# Exit on error
set -e

echo "Setting up Legal Assistant Application..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install UI dependencies
echo "Installing UI dependencies..."
cd UI
npm install
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
