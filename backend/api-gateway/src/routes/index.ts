import express, { Router } from 'express';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import userRoutes from './user.routes';

const router: Router = express.Router();

// API routes
router.use('/api/products', productRoutes);
router.use('/api/categories', categoryRoutes); 
router.use('/api/orders', orderRoutes);
router.use('/api/users', userRoutes);

export default router;
