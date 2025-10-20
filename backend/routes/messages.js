const express = require('express')

const router = express.Router()

// Get all messages
router.get('/', (req,res) => {
    res.json({mssg : 'Get All messages'})
});

// Get a single message
router.get('/:id', (req,res) => {
    res.json({mssg : 'Get a single message'})
});

// Post a new message
router.post('/', (req,res) => {
    
    res.json({mssg : 'POST a new message'})
});

// Delete a  message
router.delete('/:id', (req,res) => {
    res.json({mssg : 'DELETE a new message'})
});

// Update a message
router.delete('/:id', (req,res) => {
    res.json({mssg : 'UPDATE a new message'})
});



module.exports = router