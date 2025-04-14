import React, { useState } from 'react';
import './UploadModal.css';

function UploadModal({ show, onClose }) {
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [section, setSection] = useState('F'); // Default to 'F' as requested
  const [selectedFile, setSelectedFile] = useState(null);

  const sections = ["A", "B", "D", "E", "F"]; // Add other sections if needed

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Client Document</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="lastName">Client Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ssn">Social Security Number:</label>
            <input
              type="text" // Consider "password" for masking in production
              id="ssn"
              value={ssn}
              onChange={(e) => setSsn(e.target.value)}
              required
              // Add pattern for SSN format if desired: pattern="\d{3}-\d{2}-\d{4}"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="section">Data Section:</label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fileUpload">Select File:</label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              required
            />
          </div>
          
          {selectedFile && (
            <div className="file-info">
              Selected file: {selectedFile.name}
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="upload-button">Upload Document</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
