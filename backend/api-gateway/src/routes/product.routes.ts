import express, { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001';

const axiosInstance = axios.create({
  timeout: 5000,
  maxRedirects: 5,
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => status >= 200 && status < 500
});

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('Fetching products from:', `${PRODUCT_SERVICE_URL}/products`);
    const response = await axiosInstance.get(`${PRODUCT_SERVICE_URL}/products`);
    console.log('Products fetched successfully:', response.status);
    res.json(response.data);
  } catch (error: any) {
    console.error('Product service error:', {
      url: `${PRODUCT_SERVICE_URL}/products`,
      method: 'GET',
      error: error.message,
      response: error.response?.data
    });
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    // Input validation
    const { name, price, category, description } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({
        message: 'Name, price, and category are required'
      });
    }

    // Log the incoming request
    console.log('Creating product:', {
      url: `${PRODUCT_SERVICE_URL}/products`,
      body: req.body
    });

    // Add retry logic
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const response = await axiosInstance.post(`${PRODUCT_SERVICE_URL}/products`, req.body);

        console.log('Product created successfully:', response.data);
        return res.status(201).json(response.data);
      } catch (error: any) {
        lastError = error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        break;
      }
    }

    // If we get here, all retries failed
    console.error('Failed to create product after retries:', {
      url: `${PRODUCT_SERVICE_URL}/products`,
      method: 'POST',
      error: lastError?.message,
      response: lastError?.response?.data,
      body: req.body,
      stack: lastError?.stack
    });

    return res.status(lastError?.response?.status || 500).json({
      message: lastError?.response?.data?.message || 'Error creating product',
      error: lastError?.message,
      details: lastError?.response?.data
    });
  } catch (error: any) {
    console.error('Unexpected error in create product route:', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      message: 'Unexpected error while creating product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const response = await axiosInstance.put(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error: any) {
    console.error('Error updating product:', {
      id: req.params.id,
      error: error.message,
      response: error.response?.data
    });
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || 'Error updating product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await axiosInstance.delete(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting product:', {
      id: req.params.id,
      error: error.message,
      response: error.response?.data
    });
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || 'Error deleting product',
      error: error.message
    });
  }
});

export default router;
