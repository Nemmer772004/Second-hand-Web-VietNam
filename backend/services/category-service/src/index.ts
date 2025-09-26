import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import categoryRoutes from './routes/category.routes';

const app = express();
const port = process.env.PORT || 3002;

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`Category service running on port ${port}`);
});
