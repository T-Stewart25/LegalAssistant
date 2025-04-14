import React, { useState } from 'react';
import './Header.css';
import UploadModal from './UploadModal';


function Header() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleOpenModal = () => setShowUploadModal(true);
  const handleCloseModal = () => setShowUploadModal(false);

  return (
    <>
      <header className="app-header">
        <div className="logo">Stewart Disability Law Firm</div>
        <div className="header-actions">
           <button onClick={handleOpenModal} className="upload-trigger-btn">
             Upload Client Data
           </button>
           {/* Placeholder icons/buttons */}
           <div className="user-controls">
             <span>☰</span>
             <span>⚙</span>
             <span>👤</span>
           </div>
        </div>
      </header>
      {/* Render modal conditionally - We'll replace the placeholder later */}
      <UploadModal show={showUploadModal} onClose={handleCloseModal} />
    </>
  );
}

export default Header;
