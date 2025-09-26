import express, { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();
const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3002';

// Get all categories
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${CATEGORY_SERVICE_URL}/categories`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${CATEGORY_SERVICE_URL}/categories/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${CATEGORY_SERVICE_URL}/categories`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${CATEGORY_SERVICE_URL}/categories/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${CATEGORY_SERVICE_URL}/categories/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;
