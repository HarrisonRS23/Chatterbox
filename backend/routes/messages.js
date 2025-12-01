const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/userModel");

const router = express.Router();

// Configure multer for file uploads - store in memory for MongoDB
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Require authentication for all routes
router.use(requireAuth);

// ---------- Get messages (supports both 1-on-1 and group messages) ----------
router.get("/", async (req, res) => {
  const userId = req.user.id;
  const { sender, receiver, group } = req.query;

  try {
    let filter = {};

    if (group) {
      // Fetch messages for a specific group
      filter = { group: group };
    } else if (sender && receiver) {
      // Fetch 1-on-1 messages between two users
      filter = {
        $or: [
          { sender, recipient: receiver },
          { sender: receiver, recipient: sender },
        ],
      };
    } else {
      // Fetch all messages for user (both 1-on-1 and groups they're in)
      // First get all groups user is a member of
      const userGroups = await Group.find({ members: userId }).select("_id");
      const groupIds = userGroups.map(g => g._id);
      
      filter = {
        $or: [
          { sender: userId },
          { recipient: userId },
          { group: { $in: groupIds } }
        ]
      };
    }

    const messages = await Message.find(filter)
      .select("-image.data") // Exclude image buffer from response
      .sort({ createdAt: 1 })
      .populate("sender", "email firstname lastname")
      .populate("recipient", "email firstname lastname")
      .populate("group", "name members");

    // Add imageId to messages that have images
    const messagesWithImageId = messages.map(msg => {
      const msgObj = msg.toObject();
      if (msgObj.image && msgObj.image.contentType) {
        msgObj.imageId = msg._id.toString();
      }
      return msgObj;
    });

    res.status(200).json(messagesWithImageId);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});

// ---------- Get all unique conversations for a user ----------
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .select("-image.data") // Exclude image buffer from response
      .populate("sender", "email firstname lastname")
      .populate("recipient", "email firstname lastname")


    const currentUser = await User.findById(userId).populate(
      "friends", "email firstname lastname"
    );

    const participants = new Map();

    // Add users from messages
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      if (otherUser && !participants.has(otherUser._id.toString())) {
        participants.set(otherUser._id.toString(), otherUser);
      }
    });

    // Include friends who haven't been messaged yet
    if (currentUser && currentUser.friends) {
      currentUser.friends.forEach((friend) => {
        if (!participants.has(friend._id.toString())) {
          participants.set(friend._id.toString(), friend);
        }
      });
    }

    res.status(200).json(Array.from(participants.values()));
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Server error fetching conversations" });
  }
});

// ---------- Create a new message ----------
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: err.message });
      }
      // Handle other errors (like fileFilter errors)
      if (err.message === "Only image files are allowed") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: "File upload error: " + err.message });
    }
    next();
  });
}, async (req, res) => {
  // Debug logging
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  console.log("Content-Type:", req.headers['content-type']);
  
  // Safely extract from req.body (multer populates this for form-data)
  // If req.body is undefined, initialize it as empty object
  const body = req.body || {};
  const contents = body.contents || "";
  const recipient = body.recipient;
  const groupId = body.group;
  const sender = req.user?.id || req.user?._id; // Use .id or ._id from decoded token

  // At least one of contents or image must be provided
  if ((!contents || !contents.trim()) && !req.file) {
    return res.status(400).json({ error: "Either message content or an image is required" });
  }

  // Either recipient (1-on-1) or group must be provided, but not both
  if (!recipient && !groupId) {
    return res.status(400).json({ error: "Either recipient or group is required" });
  }

  if (recipient && groupId) {
    return res.status(400).json({ error: "Cannot specify both recipient and group" });
  }

  if (!sender) {
    console.error("Sender not found in req.user:", req.user);
    return res.status(401).json({ error: "User authentication failed" });
  }

  // Ensure sender is a string (ObjectId string)
  const senderId = String(sender);

  try {
    // Prepare image data for MongoDB if file was uploaded
    let imageData = null;
    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const message = await Message.create({
      contents: contents || "",
      image: imageData,
      sender: senderId,
      recipient: recipient || null,
      group: groupId || null
    });

    // Populate sender, recipient (if 1-on-1), and group (if group message) info
    await message.populate("sender", "email firstname lastname");
    if (recipient) {
      await message.populate("recipient", "email firstname lastname");
    }
    if (groupId) {
      await message.populate("group", "name members");
    }

    // Return message without image buffer (send imageId instead)
    const messageResponse = message.toObject();
    if (messageResponse.image && messageResponse.image.data) {
      messageResponse.imageId = message._id.toString();
      delete messageResponse.image; // Don't send the buffer in the response
    }

    res.status(201).json(messageResponse);
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ error: "Server error creating message", details: err.message });
  }
});

// ---------- Add a friend ----------
router.post("/friends/add", async (req, res) => {
  const body = req.body || {};
  const { userId, friendEmail } = body;

  if (!friendEmail || !friendEmail.trim()) {
    return res.status(400).json({ error: "Friend email is required" });
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const friend = await User.findOne({ email: friendEmail.toLowerCase().trim() });
    if (!friend) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    if (currentUser._id.toString() === friend._id.toString()) {
      return res.status(400).json({ error: "Cannot add yourself as a friend" });
    }

    if (!currentUser.friends) currentUser.friends = [];
    if (currentUser.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    currentUser.friends.push(friend._id);
    await currentUser.save();

    res.status(200).json({
      message: "Friend added successfully",
      friend: { _id: friend._id, email: friend.email, firstname: friend.firstname, lastname: friend.lastname }

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
    const user = await User.findById(userId).populate("friends", "email firstname lastname");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friends || []);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ error: "Server error while fetching friends" });
  }
});

// ---------- Get image by message ID ----------
router.get("/image/:messageId", async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const message = await Message.findById(messageId).select("image sender recipient");

    if (!message || !message.image || !message.image.data) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Verify user has access to this message (must be sender or recipient)
    const senderId = message.sender?.toString() || message.sender;
    const recipientId = message.recipient?.toString() || message.recipient;
    const userIdStr = userId?.toString() || userId;

    if (senderId !== userIdStr && recipientId !== userIdStr) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Set appropriate content type and send image buffer
    res.contentType(message.image.contentType);
    res.send(message.image.data);
  } catch (err) {
    console.error("Get image error:", err);
    res.status(500).json({ error: "Server error fetching image" });
  }
});

module.exports = router;
