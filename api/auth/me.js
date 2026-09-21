import { connectToDatabase, UserModel, memoryStore } from '../_lib/db.js';
import { getBearerToken, verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    const dbState = await connectToDatabase();
    let user = null;

    if (!dbState.isFallback) {
      user = await UserModel.findById(decoded.userId).select('-password');
    } else {
      user = memoryStore.findUserById(decoded.userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const userId = user._id ? user._id.toString() : user.id;

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({
      message: 'Internal server error while verifying session.',
      error: error.message,
    });
  }
}
