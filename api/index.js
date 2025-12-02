import express from 'express';
import cors from 'cors';
import dashboardRouter from '../server/routes/dashboard.js';
import masterTableRouter from '../server/routes/master-table.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', dashboardRouter);
app.use('/api/master-table', masterTableRouter);

// For Vercel serverless
export default app;

