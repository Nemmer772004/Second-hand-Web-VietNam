import express, { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004';

// Get all users
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${USER_SERVICE_URL}/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user 
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
