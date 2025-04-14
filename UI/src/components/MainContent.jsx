import React, { useState, useEffect } from 'react';
import './MainContent.css';
import mockClients from '../mockData/clients';
import { useAppContext } from '../context/AppContext';

function MainContent() {
  // Get the active section from context
  const { activeSection } = useAppContext();
  // Client state
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionSummary, setSectionSummary] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'Hello! Select a client and section to view case information.' },
  ]);
  const [inputText, setInputText] = useState('');

  // Load mock clients on component mount and handle section changes
  useEffect(() => {
    setClients(mockClients);
    // Set default selected client (first one)
    if (mockClients.length > 0) {
      setSelectedClient(mockClients[0]);
    }
  }, []);
  
  // Handle section changes from context
  useEffect(() => {
    if (activeSection && selectedClient) {
      handleSectionSelect(activeSection);
    }
  }, [activeSection, selectedClient]);

  // Handle client selection change
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setSelectedSection(null); // Reset section when client changes
    setSectionSummary('');
    
    // Add a message about the client change
    const newMessage = {
      id: messages.length + 1,
      sender: 'System',
      text: `Switched to client: ${client.firstName} ${client.lastName} (ID: ${client.id})`,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle section selection
  const handleSectionSelect = (sectionKey) => {
    if (!selectedClient) return;
    
    setSelectedSection(sectionKey);
    
    const section = selectedClient.sections[sectionKey];
    if (section && section.available) {
      setSectionSummary(section.summary);
      
      // Add a message with the section summary
      const newMessage = {
        id: messages.length + 1,
        sender: 'AI',
        text: `Section ${sectionKey} Summary: ${section.summary}`,
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      setSectionSummary('No data available for this section.');
      
      // Add a message about missing data
      const newMessage = {
        id: messages.length + 1,
        sender: 'AI',
        text: `No data available for Section ${sectionKey}.`,
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'User',
      text: inputText,
    };

    // Add user message
    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate AI response (replace with actual RAG call later)
    setTimeout(() => {
      let responseText = `I'm analyzing your question about "${inputText}"...`;
      
      // If a client and section are selected, make the response more specific
      if (selectedClient && selectedSection) {
        responseText += ` Looking at ${selectedClient.lastName}'s Section ${selectedSection} data.`;
      } else if (selectedClient) {
        responseText += ` Looking at ${selectedClient.lastName}'s case information.`;
      }
      
      const aiResponse = {
        id: messages.length + 2,
        sender: 'AI',
        text: responseText,
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };

  return (
    <main className="main-content">
      {/* Client info header */}
      <div className="client-info-header">
        <div className="client-selector">
          <select 
            value={selectedClient?.id || ''} 
            onChange={handleClientChange}
            className="client-select"
          >
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.lastName}, {client.firstName} ({client.id})
              </option>
            ))}
          </select>
        </div>
        
        {selectedClient && (
          <div className="client-status">
            <span className={`status-indicator ${selectedClient.status}`}></span>
            <span className="status-text">{selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)} Case</span>
          </div>
        )}
      </div>

      {/* Message display area */}
      <div className="message-display-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender.toLowerCase()}`}>
            <span className="sender">{msg.sender}:</span>
            <p className="text">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Message input fixed at bottom */}
      <form onSubmit={handleSendMessage} className="message-input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default MainContent;
