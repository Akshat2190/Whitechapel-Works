import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/chat.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// --- API to register user ---
export const registerUser = async (req, res) => {
  console.log("--- Register attempt started ---");
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    console.log("1. Checked for existing user.");

    if (userExists) {
      console.log("Register Error: User already exists.");
      // Use a 400 status code for client errors
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 2. Create new user (password will be hashed by the pre-save hook in User.js)
    const user = await User.create({ name, email, password });
    console.log("2. New user created in database.");

    // 3. Generate token
    const token = generateToken(user._id);
    console.log("3. Token generated successfully.");

    // 4. Send success response
    res.status(201).json({ success: true, token });
    console.log("4. Successfully sent registration response.");
  } catch (error) {
    // This will catch any unexpected errors (e.g., database connection issue)
    console.error("!!! UNEXPECTED CRASH IN REGISTER FUNCTION !!!", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --- API to login user ---
export const loginUser = async (req, res) => {
  console.log("--- Login attempt started ---");
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });
    console.log("1. Database search for user completed.");

    if (!user) {
      console.log("Login Error: User not found.");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 2. Compare passwords
    console.log("2. User found. Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("3. Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Login Error: Passwords do not match.");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate token
    const token = generateToken(user._id);
    console.log("4. Token generated successfully.");

    // 5. Send success response
    res.status(200).json({ success: true, token });
    console.log("5. Successfully sent login response.");
  } catch (error) {
    // This will catch any unexpected errors
    console.error("!!! UNEXPECTED CRASH IN LOGIN FUNCTION !!!", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --- API to get user data ---
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- API to get published images ---
export const getPublishedImages = async (req, res) => {
  try {
    const publishedImagesMessages = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.isImage": true,
          "messages.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          imageUrl: "$messages.content",
          userName: "$userName",
        },
      },
    ]);

    res.json({ success: true, images: publishedImagesMessages.reverse() });
  } catch (error) {
    console.error("Error in getPublishedImages:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};