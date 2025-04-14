import React, { useState } from 'react';
import './ChatInterface.css'; // We'll create this CSS file next

function ChatInterface() {
  const [messages, setMessages] = useState([
    // Example initial messages
    { id: 1, sender: 'AI', text: 'Hello! How can I assist you with this case today?' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return; // Don't send empty messages

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
      const aiResponse = {
        id: messages.length + 2,
        sender: 'AI',
        text: `Thinking about "${newMessage.text}"... (Replace with actual RAG response)`,
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };

  return (
    <div className="chat-interface">
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender.toLowerCase()}`}>
            <span className="sender">{msg.sender}:</span>
            <p className="text">{msg.text}</p>
          </div>
        ))}
        {/* Add a ref here and scrollIntoView for auto-scrolling */}
      </div>
      <form onSubmit={handleSendMessage} className="message-input-area">
        {/* Add attachment/mic icons if needed */}
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatInterface;
