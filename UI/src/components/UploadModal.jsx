import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './UploadModal.css';

function UploadModal({ show, onClose }) {
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [section, setSection] = useState('F'); // Default to 'F' as requested
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const sections = ["A", "B", "D", "E", "F"]; // Add other sections if needed

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    console.log('Submitting data:');
    console.log('Last Name:', lastName);
    console.log('SSN:', ssn); // Be mindful of logging sensitive data
    console.log('Section:', section);
    console.log('File:', selectedFile.name, selectedFile.size, selectedFile.type);

    // Placeholder for actual upload logic to the backend/Python script
    alert(`Simulating upload for ${lastName}, Section ${section}, File: ${selectedFile.name}`);
    
    // Close modal after submission
    onClose();
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: -30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: 30,
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="modal-overlay" 
          onClick={onClose}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="modal-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                Upload Client Document
              </motion.h2>
              <motion.button 
                className="close-button" 
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fas fa-times"></i>
              </motion.button>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="upload-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="form-group" variants={formItemVariants}>
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
              
              <motion.div className="form-group" variants={formItemVariants}>
                <label htmlFor="ssn">Social Security Number:</label>
                <motion.input
                  type="text" // Consider "password" for masking in production
                  id="ssn"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  required
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.2)" }}
                  // Add pattern for SSN format if desired: pattern="\d{3}-\d{2}-\d{4}"
                />
              </motion.div>
              
              <motion.div className="form-group" variants={formItemVariants}>
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
                variants={formItemVariants}
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
              
              <motion.div 
                className="form-actions"
                variants={formItemVariants}
              >
                <motion.button 
                  type="button" 
                  className="cancel-button" 
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-times" style={{ marginRight: '5px' }}></i>
                  Cancel
                </motion.button>
                <motion.button 
                  type="submit" 
                  className="upload-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-cloud-upload-alt" style={{ marginRight: '5px' }}></i>
                  Upload Document
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UploadModal;
