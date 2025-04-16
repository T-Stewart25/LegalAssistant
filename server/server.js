const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Log environment information for debugging
console.log('Environment variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${process.env.PORT}`);
console.log(`- WEBSITES_PORT: ${process.env.WEBSITES_PORT}`);
console.log(`- Using port: ${PORT}`);

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

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // In Azure, the frontend files are in the root directory, not in UI/dist
  const staticPath = path.join(__dirname, '../');
  console.log(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const indexPath = path.join(__dirname, '../index.html');
    console.log(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start the server
console.log(`Attempting to start server on port ${PORT}`);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. This could be due to another instance of the app running.`);
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
