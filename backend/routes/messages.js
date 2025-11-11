const express = require('express')
const Message = require('../models/messageModel')
const requireAuth = require('../middleware/requireAuth')

const {
    createMessage,
    getMessage,
    getMessages,
    deleteMessage,
    updateMessage
} = require('../controllers/messengerController')

const router = express.Router()
router.use(requireAuth)

// Get all messages
router.get('/', getMessages)

// Get a single message
router.get('/:id', getMessage)

// Post a new message
router.post('/', createMessage) 

// Delete a  message
router.delete('/:id', deleteMessage);

// Update a message
//router.path('/:id', updateMessage);


module.exports = router