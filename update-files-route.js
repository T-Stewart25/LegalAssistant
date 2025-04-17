const fs = require('fs');
const path = require('path');

// Path to the files.js route file
const filesRoutePath = path.join(__dirname, 'server', 'routes', 'files.js');

// Check if the files.js file exists
if (!fs.existsSync(filesRoutePath)) {
  console.error(`Files route file not found at ${filesRoutePath}`);
  process.exit(1);
}

// Read the current files.js file
let filesRouteContent = fs.readFileSync(filesRoutePath, 'utf8');

// Updated files.js content with improved path handling for Azure App Service
const updatedFilesRouteContent = `const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Helper function to get uploads directory path based on environment
function getUploadsDir() {
  // In production (Azure), use a path that's accessible and persisted
  if (process.env.NODE_ENV === 'production') {
    // Log the environment for debugging
    console.log('Getting uploads directory for production environment');
    
    // In Azure App Service, we need to use a path relative to the server
    const uploadsDir = path.join(__dirname, '../../uploads');
    console.log('Using uploads directory:', uploadsDir);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory:', uploadsDir);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    return uploadsDir;
  } else {
    // In development, use the local uploads directory
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    return uploadsDir;
  }
}

// Upload file endpoint
router.post('/upload', async (req, res) => {
  try {
    console.log('File upload request received');
    
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files were uploaded');
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const uploadedFile = req.files.file;
    console.log('File received:', uploadedFile.name);
    
    const uploadsDir = getUploadsDir();
    const uploadPath = path.join(uploadsDir, uploadedFile.name);
    
    console.log('Saving file to:', uploadPath);

    // Move the file to the uploads directory
    await uploadedFile.mv(uploadPath);
    console.log('File saved successfully');

    res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.name,
      filePath: \`/uploads/\${uploadedFile.name}\`
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Get all files endpoint
router.get('/', (req, res) => {
  try {
    console.log('Get files request received');
    const uploadsDir = getUploadsDir();
    console.log('Reading files from:', uploadsDir);
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory does not exist');
      return res.status(200).json({ files: [] });
    }

    // Read all files in the uploads directory
    const files = fs.readdirSync(uploadsDir)
      .filter(file => !file.startsWith('.')) // Filter out hidden files
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: \`/uploads/\${file}\`,
          size: stats.size,
          lastModified: stats.mtime
        };
      });

    console.log(\`Found \${files.length} files\`);
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

// Delete file endpoint
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    console.log(\`Delete file request received for: \${filename}\`);
    
    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, filename);
    console.log('Deleting file at:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found');
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    console.log('File deleted successfully');

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

module.exports = router;
`;

// Write the updated files.js file
fs.writeFileSync(filesRoutePath, updatedFilesRouteContent);

console.log('Successfully updated files.js route with improved path handling for Azure App Service');
console.log('Next steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. The GitHub workflow will deploy the updated application to Azure');
