const fs = require('fs');
const path = require('path');

// Path to the server.js file
const serverPath = path.join(__dirname, 'server', 'server.js');

// Check if the server.js file exists
if (!fs.existsSync(serverPath)) {
  console.error(`Server file not found at ${serverPath}`);
  process.exit(1);
}

// Read the current server.js file
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Updated server.js content with improved logging and path handling
const updatedServerContent = `const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced environment logging for Azure App Service
console.log('=== SERVER STARTUP ===');
console.log('Current time:', new Date().toISOString());
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());

// Log environment variables
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('WEBSITES_PORT:', process.env.WEBSITES_PORT);
console.log('Using port:', PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
}));

// API Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Determine the static files path based on the environment
let staticPath;
if (process.env.NODE_ENV === 'production') {
  // In Azure App Service, the frontend files are in the root directory
  staticPath = path.join(__dirname, '../');
  console.log('Production static path:', staticPath);
  
  // Check if the directory exists
  if (fs.existsSync(staticPath)) {
    console.log('Static directory exists');
    
    // List files in the static directory
    try {
      const files = fs.readdirSync(staticPath);
      console.log('Files in static directory:', files);
      
      // Check for index.html
      const indexPath = path.join(staticPath, 'index.html');
      console.log('Looking for index.html at:', indexPath);
      console.log('index.html exists:', fs.existsSync(indexPath));
    } catch (err) {
      console.error('Error reading static directory:', err);
    }
  } else {
    console.log('Static directory does not exist');
  }
  
  // Serve static files
  app.use(express.static(staticPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const indexPath = path.join(staticPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    
    // Check if index.html exists
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      
      // Try to use fallback-index.html instead
      const fallbackPath = path.join(staticPath, 'fallback-index.html');
      console.log('Checking for fallback-index.html at:', fallbackPath);
      
      if (fs.existsSync(fallbackPath)) {
        console.log('Using fallback-index.html');
        res.sendFile(fallbackPath);
      } else {
        console.error('fallback-index.html not found at:', fallbackPath);
        res.status(404).send('index.html not found. Please check server logs for more information.');
      }
    }
  });
} else {
  // In development, we don't need to serve static files as the React dev server handles it
  console.log('Development mode - not serving static files');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start the server
console.log(\`Attempting to start server on port \${PORT}\`);

const server = app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(\`Port \${PORT} is already in use. This could be due to another instance of the app running.\`);
    console.error('Using Azure App Service? Try setting WEBSITES_PORT in Application Settings to match your PORT env variable.');
  } else {
    console.error('Server error:', err);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app; // For testing purposes
`;

// Write the updated server.js file
fs.writeFileSync(serverPath, updatedServerContent);

console.log('Successfully updated server.js with improved logging and path handling');
console.log('Next steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. The GitHub workflow will deploy the updated application to Azure');
console.log('3. Check the Azure App Service logs for diagnostic information');
