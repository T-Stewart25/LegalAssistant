const express = require('express');
const router = express.Router();

// Simple in-memory message store for demonstration
// In a production app, you would use a database
const messages = [];

// Get all chat messages
router.get('/', (req, res) => {
  try {
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      message: 'Failed to retrieve messages',
      error: error.message
    });
  }
});

// Send a new message
router.post('/', (req, res) => {
  try {
    const { sender, content } = req.body;
    
    if (!sender || !content) {
      return res.status(400).json({ message: 'Sender and content are required' });
    }
    
    const newMessage = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    // In a real app, you might broadcast this message to other connected clients
    // using WebSockets or a similar technology
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Delete a message
router.delete('/:id', (req, res) => {
  try {
    const messageId = req.params.id;
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    messages.splice(messageIndex, 1);
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

module.exports = router;
