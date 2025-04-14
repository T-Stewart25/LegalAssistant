import React, { createContext, useState, useContext } from 'react';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState(null);

  // Function to be called from LeftSidebar
  const handleSectionSelect = (sectionKey) => {
    setActiveSection(sectionKey);
    console.log(`Selected section from context: ${sectionKey}`);
  };

  // Values to be provided to consumers
  const contextValue = {
    activeSection,
    handleSectionSelect
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
