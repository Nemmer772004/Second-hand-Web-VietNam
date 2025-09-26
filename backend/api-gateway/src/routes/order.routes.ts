import express, { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Get all orders
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID 
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${ORDER_SERVICE_URL}/orders/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${ORDER_SERVICE_URL}/orders/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
});

export default router;
