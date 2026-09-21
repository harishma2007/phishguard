import { connectToDatabase, UserModel, memoryStore } from '../_lib/db.js';
import { comparePassword, signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbState = await connectToDatabase();

    let user = null;
    if (!dbState.isFallback) {
      user = await UserModel.findOne({ email: normalizedEmail });
    } else {
      user = memoryStore.findUserByEmail(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = signToken({
      userId,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userId,
        email: user.email,
      },
      storageMode: dbState.isFallback ? 'In-Memory (configure MONGODB_URI for persistence)' : 'MongoDB',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Internal server error during login.',
      error: error.message,
    });
  }
}
