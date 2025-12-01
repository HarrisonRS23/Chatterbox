const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Group = require("../models/groupModel");
const Message = require("../models/messageModel");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/userModel");

const router = express.Router();

// Configure multer for group image uploads
const storage = multer.memoryStorage();
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Require authentication for all routes
router.use(requireAuth);

// ---------- Create a new group ----------
router.post("/", upload.single("image"), async (req, res) => {
  const { name, description, memberIds } = req.body;
  const adminId = req.user?.id || req.user?._id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Group name is required" });
  }

  if (!adminId) {
    return res.status(401).json({ error: "User authentication failed" });
  }

  try {
    // Parse memberIds (should be JSON array string)
    let members = [adminId]; // Admin is always a member
    if (memberIds) {
      try {
        const parsedMembers = typeof memberIds === 'string' ? JSON.parse(memberIds) : memberIds;
        if (Array.isArray(parsedMembers)) {
          members = [...new Set([adminId, ...parsedMembers])]; // Remove duplicates
        }
      } catch (e) {
        return res.status(400).json({ error: "Invalid memberIds format" });
      }
    }

    // Prepare image data if uploaded
    let imageData = null;
    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      members: members,
      admin: adminId,
      image: imageData
    });

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    // Return group without image buffer
    const groupResponse = group.toObject();
    if (groupResponse.image && groupResponse.image.data) {
      groupResponse.imageId = group._id.toString();
      delete groupResponse.image;
    }

    res.status(201).json(groupResponse);
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ error: "Server error creating group", details: err.message });
  }
});

// ---------- Get all groups for a user ----------
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = await Group.find({
      members: userId
    })
      .select("-image.data") // Exclude image buffer
      .populate("members", "email firstname lastname")
      .populate("admin", "email firstname lastname")
      .sort({ updatedAt: -1 });

    // Add imageId to groups that have images
    const groupsWithImageId = groups.map(group => {
      const groupObj = group.toObject();
      if (groupObj.image && groupObj.image.contentType) {
        groupObj.imageId = group._id.toString();
      }
      return groupObj;
    });

    res.status(200).json(groupsWithImageId);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ error: "Server error fetching groups" });
  }
});

// ---------- Get group image (must be before /:groupId route) ----------
router.get("/image/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId).select("image members");

    if (!group || !group.image || !group.image.data) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.contentType(group.image.contentType);
    res.send(group.image.data);
  } catch (err) {
    console.error("Get group image error:", err);
    res.status(500).json({ error: "Server error fetching image" });
  }
});

// ---------- Get a specific group ----------
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId)
      .select("-image.data")
      .populate("members", "email firstname lastname")
      .populate("admin", "email firstname lastname");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    const groupObj = group.toObject();
    if (groupObj.image && groupObj.image.contentType) {
      groupObj.imageId = group._id.toString();
    }

    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Get group error:", err);
    res.status(500).json({ error: "Server error fetching group" });
  }
});

// ---------- Add members to a group ----------
router.post("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: "Member IDs are required" });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group admin can add members" });
    }

    // Add new members (avoid duplicates)
    const existingMemberIds = group.members.map(m => m.toString());
    const newMembers = memberIds.filter(id => !existingMemberIds.includes(id.toString()));
    
    if (newMembers.length === 0) {
      return res.status(400).json({ error: "All users are already members" });
    }

    group.members.push(...newMembers);
    await group.save();

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    const groupObj = group.toObject();
    if (groupObj.image && groupObj.image.contentType) {
      groupObj.imageId = group._id.toString();
      delete groupObj.image;
    }

    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Add members error:", err);
    res.status(500).json({ error: "Server error adding members" });
  }
});

// ---------- Remove member from group ----------
router.delete("/:groupId/members/:memberId", async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin or removing themselves
    const isAdmin = group.admin.toString() === userId.toString();
    const isRemovingSelf = memberId === userId.toString();

    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ error: "Only admin can remove other members" });
    }

    // Can't remove admin
    if (group.admin.toString() === memberId) {
      return res.status(400).json({ error: "Cannot remove group admin" });
    }

    group.members = group.members.filter(
      m => m.toString() !== memberId
    );
    await group.save();

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    const groupObj = group.toObject();
    if (groupObj.image && groupObj.image.contentType) {
      groupObj.imageId = group._id.toString();
      delete groupObj.image;
    }

    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ error: "Server error removing member" });
  }
});

// ---------- Delete a group (admin only) ----------
router.delete("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group admin can delete the group" });
    }

    // Delete all messages associated with this group
    await Message.deleteMany({ group: groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ error: "Server error deleting group" });
  }
});

module.exports = router;

