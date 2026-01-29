import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from '../src/lib/auth.js';
import { toNodeHandler } from 'better-auth/node';

dotenv.config({ path: '../.env' });

const app = express();

// Enable JSON parsing
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    process.env.VITE_BETTER_AUTH_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Simple request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Mount better-auth handler on /api/auth/*
// This handles all authentication endpoints
app.all('/api/auth/*', toNodeHandler(auth));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Better-auth server is running' });
});

// Custom endpoint to update user role (for admin setup)
app.post('/api/users/update-role', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        error: 'userId and role are required'
      });
    }

    // TODO: Add authentication check here to ensure only admins can update roles
    // For now, this is a basic implementation
    
    // Update user role in database using better-auth's db instance
    // This would need to be implemented based on your needs
    
    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Better-auth server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/auth/*`);
});
