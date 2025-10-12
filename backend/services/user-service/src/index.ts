import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import { initializeDataSource } from './database.js';

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/users', userRoutes);

const bootstrap = async () => {
  try {
    await initializeDataSource();
    console.log('Connected to PostgreSQL');

    app.listen(port, () => {
      console.log(`User service running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize data source', error);
    process.exit(1);
  }
};

void bootstrap();
