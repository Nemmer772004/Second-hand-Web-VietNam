import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create user
const buildAuthResponse = (user: any, token: string) => {
  const userWithoutPassword = user.toObject ? user.toObject() : user;
  const { password: _pw, _id, ...userResponse } = userWithoutPassword;
  return {
    access_token: token,
    user: {
      id: _id?.toString?.() || userWithoutPassword.id,
      ...userResponse,
    },
  };
};

const persistSession = async (userId: string, token: string) => {
  try {
    await Session.create({
      userId,
      token,
    });
  } catch (error) {
    console.warn('Failed to persist session', error);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    await persistSession(String(savedUser._id), token);
    res.status(201).json(buildAuthResponse(savedUser, token));
  } catch (error) {
    if ((error as any)?.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password: inputPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await user.comparePassword(inputPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    await persistSession(String(user._id), token);

    res.json(buildAuthResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || req.body?.token;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    await Session.deleteOne({ token });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || req.query?.token as string;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    const session = await Session.findOne({ token });
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    let payload: { userId: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(payload.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id?.toString?.() || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current user' });
  }
};
