import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Header.css';
import UploadModal from './UploadModal';

function Header() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleOpenModal = () => setShowUploadModal(true);
  const handleCloseModal = () => setShowUploadModal(false);

  return (
    <>
      <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
        <motion.div 
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Stewart Disability Law Firm
        </motion.div>
        <div className="header-actions">
           <motion.button 
             onClick={handleOpenModal} 
             className="upload-trigger-btn"
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             Upload Client Data
           </motion.button>
           <div className="user-controls">
             <motion.span 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
             >
               <i className="fas fa-bars"></i>
             </motion.span>
             <motion.span 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
             >
               <i className="fas fa-cog"></i>
             </motion.span>
             <motion.span 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
             >
               <i className="fas fa-user"></i>
             </motion.span>
           </div>
        </div>
      </header>
      {/* Render modal conditionally */}
      <UploadModal show={showUploadModal} onClose={handleCloseModal} />
    </>
  );
}

export default Header;
