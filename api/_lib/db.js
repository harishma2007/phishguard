import mongoose from 'mongoose';

/**
 * Global cache for MongoDB connection across serverless invocations.
 */
let cached = global.mongooseConnection;
if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

// In-memory fallback stores in case MONGODB_URI is not yet configured
const inMemoryUsers = new Map();
const inMemoryHistory = [];

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_connection_string') {
    return {
      isFallback: true,
      reason: 'MONGODB_URI is not configured in environment variables.',
    };
  }

  if (cached.conn) {
    return { isFallback: false, conn: cached.conn };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection failed. Operating in fallback mode:', err.message);
      cached.promise = null;
      return null;
    });
  }

  const conn = await cached.promise;
  if (!conn) {
    return {
      isFallback: true,
      reason: 'MongoDB connection failed to initialize.',
    };
  }

  cached.conn = conn;
  return { isFallback: false, conn };
}

// User Schema & Model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

// In-memory helpers for fallback mode
export const memoryStore = {
  findUserByEmail: (email) => {
    return inMemoryUsers.get(email.toLowerCase().trim()) || null;
  },
  findUserById: (id) => {
    for (const user of inMemoryUsers.values()) {
      if (user._id === id) return user;
    }
    return null;
  },
  saveUser: (userData) => {
    const user = {
      _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      createdAt: new Date(),
    };
    inMemoryUsers.set(user.email, user);
    return user;
  },
  addHistory: (item) => {
    inMemoryHistory.unshift({
      id: 'hist_' + Date.now(),
      ...item,
      createdAt: new Date(),
    });
    if (inMemoryHistory.length > 50) inMemoryHistory.pop();
  },
  getHistory: (userId) => {
    return inMemoryHistory.filter((item) => !userId || item.userId === userId).slice(0, 10);
  },
};
