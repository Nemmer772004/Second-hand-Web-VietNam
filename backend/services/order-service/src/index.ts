import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import orderRoutes from './routes/order.routes';

const app = express();
const port = process.env.PORT || 3003;

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
app.use('/orders', orderRoutes);

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
});
