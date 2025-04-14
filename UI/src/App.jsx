import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  // State for sidebar collapse and screen width
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  // Function to toggle left sidebar
  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  // Function to toggle right sidebar
  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  // Handle screen resize and auto-collapse sidebars on narrow screens
  useEffect(() => {
    const handleResize = () => {
      const narrowScreen = window.innerWidth < 992;
      setIsNarrowScreen(narrowScreen);
      
      // Auto-collapse on narrow screens
      if (narrowScreen) {
        setLeftSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      } else {
        // Expand on wide screens
        setLeftSidebarCollapsed(false);
        setRightSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine main layout class based on sidebar states
  const mainLayoutClass = `main-layout ${leftSidebarCollapsed && rightSidebarCollapsed ? 'both-collapsed' : ''}`;

  return (
    <AppProvider>
      <div className="app-container">
        <Header />
        <div className={mainLayoutClass}>
          {/* Left sidebar */}
          <div className={`left-sidebar ${leftSidebarCollapsed ? 'collapsed' : ''}`}>
            <LeftSidebar />
          </div>
          
          {/* Left sidebar toggle button - only visible on narrow screens */}
          {isNarrowScreen && (
            <button 
              className="sidebar-toggle left-sidebar-toggle"
              onClick={toggleLeftSidebar}
              style={{ 
                left: leftSidebarCollapsed ? '0' : '260px',
                display: 'flex'
              }}
            >
              {leftSidebarCollapsed ? '→' : '←'}
            </button>
          )}

          {/* Main content */}
          <MainContent />

          {/* Right sidebar toggle button - only visible on narrow screens */}
          {isNarrowScreen && (
            <button 
              className="sidebar-toggle right-sidebar-toggle"
              onClick={toggleRightSidebar}
              style={{ 
                right: rightSidebarCollapsed ? '0' : '280px',
                display: 'flex'
              }}
            >
              {rightSidebarCollapsed ? '←' : '→'}
            </button>
          )}
          
          {/* Right sidebar */}
          <div className={`right-sidebar ${rightSidebarCollapsed ? 'collapsed' : ''}`}>
            <RightSidebar />
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
