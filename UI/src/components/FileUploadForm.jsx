import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import './FileUploadForm.css';

function FileUploadForm() {
  const { uploadFile, fetchFiles, deleteFile, files, loading, error } = useAppContext();
  
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [section, setSection] = useState('F'); // Default to 'F' as requested
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sections = ["A", "B", "D", "E", "F"]; // Add other sections if needed

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadSuccess(false); // Reset success message when a new file is selected
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      // Create a new File object with metadata in the filename
      // Format: lastName_SSN-last-4_section_originalFilename
      const ssn4 = ssn.slice(-4); // Get last 4 digits of SSN
      const fileNameParts = selectedFile.name.split('.');
      const extension = fileNameParts.pop();
      const originalName = fileNameParts.join('.');
      const newFileName = `${lastName}_${ssn4}_${section}_${originalName}.${extension}`;
      
      const fileWithMetadata = new File(
        [selectedFile], 
        newFileName, 
        { type: selectedFile.type }
      );
      
      // Upload the file with metadata in the filename
      const result = await uploadFile(fileWithMetadata);
      
      console.log('Upload successful:', result);
      setUploadSuccess(true);
      
      // Reset form
      setLastName('');
      setSsn('');
      setSection('F');
      setSelectedFile(null);
      event.target.reset(); // Reset file input
    } catch (err) {
      console.error('Upload error:', err);
      // Error is already handled in the context
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const fileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.div 
      className="file-upload-form-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={itemVariants}>Upload Client Document</motion.h3>
      <motion.form 
        onSubmit={handleSubmit} 
        className="file-upload-form"
        variants={containerVariants}
      >
        <motion.div className="form-group" variants={itemVariants}>
          <label htmlFor="lastName">Client Last Name:</label>
          <motion.input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.2)" }}
          />
        </motion.div>
        
        <motion.div className="form-group" variants={itemVariants}>
          <label htmlFor="ssn">Social Security Number:</label>
          <motion.input
            type="text" // Use "password" for masking, but validation needed
            id="ssn"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.2)" }}
            // Add pattern for SSN format if desired: pattern="\d{3}-\d{2}-\d{4}"
          />
        </motion.div>
        
        <motion.div className="form-group" variants={itemVariants}>
          <label htmlFor="section">Data Section:</label>
          <motion.select
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.2)" }}
          >
            {sections.map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </motion.select>
        </motion.div>
        
        <motion.div 
          className="form-group" 
          variants={itemVariants}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="fileUpload">Select File:</label>
          <motion.input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            required
            style={{ 
              borderColor: isDragging ? 'var(--color-secondary)' : undefined,
              backgroundColor: isDragging ? 'rgba(56, 178, 172, 0.05)' : undefined
            }}
          />
        </motion.div>
        
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              className="file-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
              Selected file: {selectedFile.name}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          type="submit" 
          className="upload-button" 
          disabled={loading.files || !selectedFile}
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading.files ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Uploading...
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt" style={{ marginRight: '8px' }}></i>
              Upload Document
            </>
          )}
        </motion.button>
        
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring" }}
            >
              <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
              File uploaded successfully!
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {error.files && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring" }}
            >
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              Error: {error.files}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
      
      {/* Display list of uploaded files */}
      <motion.div 
        className="uploaded-files-section"
        variants={containerVariants}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <motion.h4 variants={itemVariants}>Uploaded Files</motion.h4>
          <motion.button 
            onClick={() => fetchFiles()} 
            className="refresh-button"
            disabled={loading.files}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-sync-alt" style={{ marginRight: '5px' }}></i>
            Refresh
          </motion.button>
        </div>
        
        <motion.div 
          className="files-list"
          variants={containerVariants}
        >
          {files.length === 0 ? (
            <motion.p 
              variants={itemVariants}
              style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}
            >
              <i className="fas fa-folder-open" style={{ fontSize: '1.5em', display: 'block', margin: '10px auto' }}></i>
              No files uploaded yet.
            </motion.p>
          ) : (
            <motion.ul variants={containerVariants}>
              <AnimatePresence>
                {files.map((file) => (
                  <motion.li 
                    key={file.name} 
                    className="file-item"
                    variants={fileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <span className="file-name">
                      <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
                      {file.name}
                    </span>
                    <span className="file-size">
                      {Math.round(file.size / 1024)} KB
                    </span>
                    <motion.button 
                      onClick={() => deleteFile(file.name)}
                      className="delete-button"
                      disabled={loading.files}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </motion.button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          {loading.files && (
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: 'var(--color-gray-500)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5em', marginBottom: '10px', display: 'block' }}></i>
              <p>Loading files...</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default FileUploadForm;
