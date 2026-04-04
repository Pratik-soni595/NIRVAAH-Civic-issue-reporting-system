/**
 * Chatbot Routing
 */
const express = require('express');
const router = express.Router();
const { handleMessage, getChatbotData } = require('../controllers/chatbotController');

// Allow public access to the bot
router.get('/data', getChatbotData);
router.post('/message', handleMessage);

module.exports = router;
