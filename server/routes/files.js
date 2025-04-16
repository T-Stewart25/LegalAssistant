const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Upload file endpoint
router.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const uploadedFile = req.files.file;
    const uploadPath = path.join(__dirname, '../../uploads', uploadedFile.name);
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
      fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
    }

    // Move the file to the uploads directory
    await uploadedFile.mv(uploadPath);

    res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.name,
      filePath: `/uploads/${uploadedFile.name}`
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
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({ files: [] });
    }

    // Read all files in the uploads directory
    const files = fs.readdirSync(uploadsDir)
      .filter(file => !file.startsWith('.')) // Filter out hidden files
      .map(file => ({
        name: file,
        path: `/uploads/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size,
        lastModified: fs.statSync(path.join(uploadsDir, file)).mtime
      }));

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
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

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
