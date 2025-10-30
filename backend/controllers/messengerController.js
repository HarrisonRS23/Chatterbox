const { default: mongoose } = require('mongoose')
const Message = require('../models/messageModel')

// get all messages

const getMessages = async ( req, res ) => {
    const messages = await Message.find({}).sort({createdAt: -1})
    res.status(200).json(messages)
}


// get a single message

const getMessage = async ( req, res ) => {
    const {id} = req.params

    const message = await Message.findById(id)

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "no such message"})
    }

    if(!message){
        return res.status(404).json({error: "no such message"})
    }

    res.status(200).json(message)
}

// create a new message
const createMessage = async (req, res) => {

    const { contents, sender, recipient } = req.body

    // add doc to db 
    try {
        const message = await Message.create({ contents, sender, recipient })
        res.status(200).json(message)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}




// delete a message 

const deleteMessage = async (req,res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such message"})
    }
    const message = await Message.findOneAndDelete({_id: id})

     if(!message){
        return res.status(404).json({error: "No such message"})
    }
    res.status(200).json(message)
}



// update a message 
const updateMessage = async (req,res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No such message"})
    }

    const message = await Message.findOneAndUpdate({_id: id, 
        ...req.body // spread out contents to update 
    })

    if(!message){
        return res.status(404).json({error: "No such message"})
    }
    res.status(200).json(message)
}

module.exports = {
    createMessage,
    getMessage,
    getMessages,
    deleteMessage,
    updateMessage
}