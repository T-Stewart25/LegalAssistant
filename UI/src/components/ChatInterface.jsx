import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.div 
      className="chat-interface"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="message-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {messages.length === 0 && !loading.messages ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <i className="fas fa-comments fa-3x" style={{ color: 'var(--color-gray-400)' }}></i>
            <p>No messages yet. Start a conversation!</p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  className={`message ${msg.sender.toLowerCase()}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <span className="sender">{msg.sender}:</span>
                  <p className="text">{msg.content}</p>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading.messages && (
              <motion.div 
                className="message loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}
            
            {error.messages && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring" }}
              >
                <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                Error: {error.messages}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </motion.div>
      
      <motion.form 
        onSubmit={handleSendMessage} 
        className="message-input-area"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading.messages}
          whileFocus={{ scale: 1.01 }}
        />
        <motion.button 
          type="submit" 
          disabled={loading.messages || !inputText.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading.messages ? 'Sending...' : 'Send'}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}

export default ChatInterface;
