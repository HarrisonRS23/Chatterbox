const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/userModel");

const router = express.Router();

// Require authentication for all message routes
router.use(requireAuth);

// ---------- Get messages between two users ----------
router.get("/", async (req, res) => {
  const userId = req.user._id; // from requireAuth middleware
  const { sender, receiver } = req.query;

  try {
    let filter = {};

    // If both sender and receiver are provided, return only those messages
    if (sender && receiver) {
      filter = {
        $or: [
          { sender, recipient: receiver },
          { sender: receiver, recipient: sender },
        ],
      };
    } else {
      // Default: show all messages for the logged-in user
      filter = {
        $or: [{ sender: userId }, { recipient: userId }],
      };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "email name")
      .populate("recipient", "email name");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Get all unique conversations for a user ----------
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all messages where user is involved
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "email name")
      .populate("recipient", "email name");

    // Get user's friends list
    const currentUser = await User.findById(userId).populate("friends", "email name");
    
    // Extract unique participants from messages
    const participants = new Map();
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      
      if (otherUser && !participants.has(otherUser._id.toString())) {
        participants.set(otherUser._id.toString(), otherUser);
      }
    });

    // Add friends who haven't been messaged yet
    if (currentUser && currentUser.friends) {
      currentUser.friends.forEach((friend) => {
        if (!participants.has(friend._id.toString())) {
          participants.set(friend._id.toString(), friend);
        }
      });
    }

    res.status(200).json(Array.from(participants.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Create a new message ----------
router.post("/", async (req, res) => {
  const { contents, recipient } = req.body;
  const sender = req.user._id; // sender comes from logged-in user

  try {
    const message = await Message.create({ contents, sender, recipient });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------- Add a friend ----------
router.post("/friends/add", async (req, res) => {
  const { userId, friendEmail } = req.body;

  try {
    // Validate input
    if (!friendEmail || !friendEmail.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const friend = await User.findOne({ email: friendEmail.toLowerCase().trim() });
    if (!friend) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    // Can't add yourself
    if (currentUser._id.toString() === friend._id.toString()) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }

    // Check if already friends
    if (currentUser.friends && currentUser.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Initialize friends array if it doesn't exist
    if (!currentUser.friends) {
      currentUser.friends = [];
    }

    // Add friend (one-way for now; you could make it bidirectional)
    currentUser.friends.push(friend._id);
    await currentUser.save();

    res.status(200).json({ 
      message: "Friend added successfully",
      friend: {
        _id: friend._id,
        email: friend.email,
        name: friend.name
      }
    });
  } catch (err) {
    console.error("Add friend error:", err);
    res.status(500).json({ error: "Server error while adding friend" });
  }
});

// ---------- Get user's friends list ----------
router.get("/friends/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("friends", "email name");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friends || []);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ error: "Server error while fetching friends" });
  }
});

module.exports = router;