import React, { useState } from 'react';
import './FileUploadForm.css'; // We'll create this CSS file next

function FileUploadForm() {
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
    // Example:
    // const formData = new FormData();
    // formData.append('lastName', lastName);
    // formData.append('ssn', ssn);
    // formData.append('section', section);
    // formData.append('file', selectedFile);
    // fetch('/api/upload', { method: 'POST', body: formData })
    //   .then(response => response.json())
    //   .then(data => console.log('Upload successful:', data))
    //   .catch(error => console.error('Upload error:', error));

    alert(`Simulating upload for ${lastName}, Section ${section}, File: ${selectedFile.name}`);
    // Reset form potentially
    // setLastName('');
    // setSsn('');
    // setSection('F');
    // setSelectedFile(null);
    // event.target.reset(); // Reset file input
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
        <button type="submit" className="upload-button">Upload Document</button>
      </form>
    </div>
  );
}

export default FileUploadForm;
