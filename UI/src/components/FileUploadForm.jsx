import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './FileUploadForm.css';

function FileUploadForm() {
  const { uploadFile, fetchFiles, deleteFile, files, loading, error } = useAppContext();
  
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [section, setSection] = useState('F'); // Default to 'F' as requested
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const sections = ["A", "B", "D", "E", "F"]; // Add other sections if needed

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadSuccess(false); // Reset success message when a new file is selected
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

  return (
    <div className="file-upload-form-container">
      <h3>Upload Client Document</h3>
      <form onSubmit={handleSubmit} className="file-upload-form">
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
            type="text" // Use "password" for masking, but validation needed
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
        <button 
          type="submit" 
          className="upload-button" 
          disabled={loading.files || !selectedFile}
        >
          {loading.files ? 'Uploading...' : 'Upload Document'}
        </button>
        
        {uploadSuccess && (
          <div className="success-message">
            File uploaded successfully!
          </div>
        )}
        
        {error.files && (
          <div className="error-message">
            Error: {error.files}
          </div>
        )}
      </form>
      
      {/* Display list of uploaded files */}
      <div className="uploaded-files-section">
        <h4>Uploaded Files</h4>
        <button 
          onClick={() => fetchFiles()} 
          className="refresh-button"
          disabled={loading.files}
        >
          Refresh List
        </button>
        <div className="files-list">
          {files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <ul>
              {files.map((file) => (
                <li key={file.name} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {Math.round(file.size / 1024)} KB
                  </span>
                  <button 
                    onClick={() => deleteFile(file.name)}
                    className="delete-button"
                    disabled={loading.files}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading.files && <p>Loading files...</p>}
        </div>
      </div>
    </div>
  );
}

export default FileUploadForm;
