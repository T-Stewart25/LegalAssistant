import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import './ChatInterface.css';

function ChatInterface() {
  const { 
    messages, 
    sendMessage, 
    loading, 
    error 
  } = useAppContext();
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return; // Don't send empty messages

    try {
      // Send message to the server
      await sendMessage('User', inputText);
      setInputText('');
      
      // In a real application, you would have an AI service that responds
      // For now, we'll simulate an AI response
      setTimeout(async () => {
        await sendMessage('AI', `I received your message: "${inputText}". This is a simulated response.`);
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      // Error is already handled in the context
    }
  };

  return (
    <div className="chat-interface">
      <div className="message-list">
        {messages.length === 0 && !loading.messages ? (
          <div className="empty-state">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender.toLowerCase()}`}>
                <span className="sender">{msg.sender}:</span>
                <p className="text">{msg.content}</p>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {loading.messages && (
              <div className="message loading">
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {error.messages && (
              <div className="error-message">
                Error: {error.messages}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="message-input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading.messages}
        />
        <button type="submit" disabled={loading.messages || !inputText.trim()}>
          {loading.messages ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
