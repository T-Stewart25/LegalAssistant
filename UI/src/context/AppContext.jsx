import React, { createContext, useState, useContext, useEffect } from 'react';

// API base URL - will be used for all API requests
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState({
    messages: false,
    files: false
  });
  const [error, setError] = useState({
    messages: null,
    files: null
  });

  // Function to be called from LeftSidebar
  const handleSectionSelect = (sectionKey) => {
    setActiveSection(sectionKey);
    console.log(`Selected section from context: ${sectionKey}`);
  };

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      setError(prev => ({ ...prev, messages: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/chat`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(prev => ({ ...prev, messages: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Send a new message
  const sendMessage = async (sender, content) => {
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      setError(prev => ({ ...prev, messages: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, content })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add the new message to the messages array
      setMessages(prev => [...prev, data.data]);
      
      return data.data;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(prev => ({ ...prev, messages: err.message }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Fetch files from the API
  const fetchFiles = async () => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      setError(prev => ({ ...prev, files: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/files`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(prev => ({ ...prev, files: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  // Upload a file
  const uploadFile = async (file) => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      setError(prev => ({ ...prev, files: null }));
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Refresh the files list
      await fetchFiles();
      
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(prev => ({ ...prev, files: err.message }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  // Delete a file
  const deleteFile = async (filename) => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      setError(prev => ({ ...prev, files: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/files/${filename}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status}`);
      }
      
      // Refresh the files list
      await fetchFiles();
      
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(prev => ({ ...prev, files: err.message }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchMessages();
    fetchFiles();
  }, []);

  // Values to be provided to consumers
  const contextValue = {
    activeSection,
    handleSectionSelect,
    messages,
    files,
    loading,
    error,
    fetchMessages,
    sendMessage,
    fetchFiles,
    uploadFile,
    deleteFile
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
