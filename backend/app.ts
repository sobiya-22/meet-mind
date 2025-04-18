import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


import meetRoutes from './src/routes/meetRoutes';
import userStatsRoutes from './src/routes/userStatsRoute';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/meet', meetRoutes);
app.use('/api/user', userStatsRoutes);
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});