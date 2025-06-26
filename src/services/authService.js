// Real auth service that works with Neon database
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password) => {
  return btoa(password + 'pneuma_salt'); // Base64 encoding with salt
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password } = userData;
      
      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;
      
      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }
      
      // Determine role based on admin email
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
      const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
      
      // Hash password
      const hashedPassword = hashPassword(password);
      
      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert user into database
      const newUser = await sql`
        INSERT INTO users (id, clerk_id, email, name, role, is_active, created_at, updated_at)
        VALUES (${userId}, ${userId}, ${email}, ${firstName + ' ' + lastName}, ${role}, true, NOW(), NOW())
        RETURNING id, email, name, role, created_at
      `;
      
      if (newUser.length > 0) {
        // Store password separately (in production, use proper auth service)
        localStorage.setItem(`pwd_${userId}`, hashedPassword);
        
        return { 
          success: true, 
          user: {
            ...newUser[0],
            firstName,
            lastName
          }
        };
      } else {
        return { success: false, error: 'Failed to create user' };
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed: ' + error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      // Get user from database
      const users = await sql`
        SELECT id, email, name, role, created_at, is_active
        FROM users 
        WHERE email = ${email} AND is_active = true
      `;
      
      if (users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      const user = users[0];
      
      // Check password (stored in localStorage for now)
      const storedHash = localStorage.getItem(`pwd_${user.id}`);
      if (!storedHash || !verifyPassword(password, storedHash)) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      return { 
        success: true, 
        user: {
          ...user,
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ').slice(1).join(' ') || ''
        }
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed: ' + error.message };
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const users = await sql`
        SELECT id, email, name, role, created_at, is_active
        FROM users 
        WHERE id = ${userId} AND is_active = true
      `;
      
      if (users.length > 0) {
        const user = users[0];
        return {
          ...user,
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ').slice(1).join(' ') || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Update user
  async updateUser(userId, updates) {
    try {
      const { name, email } = updates;
      
      const updatedUser = await sql`
        UPDATE users 
        SET name = ${name}, email = ${email}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, email, name, role, created_at
      `;
      
      if (updatedUser.length > 0) {
        return { success: true, user: updatedUser[0] };
      } else {
        return { success: false, error: 'User not found' };
      }
      
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Update failed: ' + error.message };
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = await sql`
        SELECT id, email, name, role, created_at, is_active
        FROM users 
        ORDER BY created_at DESC
      `;
      
      return users.map(user => ({
        ...user,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || ''
      }));
      
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${userId}
      `;
      
      // Remove password from localStorage
      localStorage.removeItem(`pwd_${userId}`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'Delete failed: ' + error.message };
    }
  }
};
