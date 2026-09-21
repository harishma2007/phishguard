import { connectToDatabase, UserModel, memoryStore } from '../_lib/db.js';
import { hashPassword, signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password, confirmPassword } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbState = await connectToDatabase();

    let existingUser = null;
    if (!dbState.isFallback) {
      existingUser = await UserModel.findOne({ email: normalizedEmail });
    } else {
      existingUser = memoryStore.findUserByEmail(normalizedEmail);
    }

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    let createdUser;

    if (!dbState.isFallback) {
      const newUser = new UserModel({
        email: normalizedEmail,
        password: hashedPassword,
      });
      await newUser.save();
      createdUser = {
        id: newUser._id.toString(),
        email: newUser.email,
        createdAt: newUser.createdAt,
      };
    } else {
      const memoryUser = memoryStore.saveUser({
        email: normalizedEmail,
        password: hashedPassword,
      });
      createdUser = {
        id: memoryUser._id,
        email: memoryUser.email,
        createdAt: memoryUser.createdAt,
      };
    }

    const token = signToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
      },
      storageMode: dbState.isFallback ? 'In-Memory (configure MONGODB_URI for persistence)' : 'MongoDB',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Internal server error during registration.',
      error: error.message,
    });
  }
}
