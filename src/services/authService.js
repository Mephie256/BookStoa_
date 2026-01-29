// Admin user management service
import { neon } from '@neondatabase/serverless';

// Initialize Neon client
// We use import.meta.env for client-side access
const dbUrl = import.meta.env.VITE_DATABASE_URL;
const sql = neon(dbUrl);

export const authService = {
  // Get all users (admin only)
  async getAllUsers() {
    try {
      // Query the new 'user' table from better-auth
      // Note: we're using "user" (singular) table now
      const users = await sql`
        SELECT id, email, name, role, "createdAt" as created_at, "isActive" as is_active
        FROM "user"
        ORDER BY "createdAt" DESC
      `;
      
      return users.map(user => ({
        ...user,
        // Helper properties for UI compatibility
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
        isActive: user.is_active
      }));
      
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Delete/Deactivate user (admin only)
  async deleteUser(userId) {
    try {
      // We perform a soft delete by setting isActive to false
      await sql`
        UPDATE "user"
        SET "isActive" = false, "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
      
      // We should also invalidate their sessions
      await sql`
        DELETE FROM "session"
        WHERE "userId" = ${userId}
      `;
      
      return { success: true };
      
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'Delete failed: ' + error.message };
    }
  },

  // Deprecated auth methods - kept empty to prevent crashes if imported elsewhere
  // Authentication is now handled by BetterAuthContext
  async register() { 
    console.warn('authService.register is deprecated. Use useAuth() register instead.');
    return { success: false, error: 'Deprecated method' };
  },
  
  async login() { 
    console.warn('authService.login is deprecated. Use useAuth() login instead.');
    return { success: false, error: 'Deprecated method' };
  },
  
  async getUserById(userId) {
    try {
      const users = await sql`
        SELECT id, email, name, role, "createdAt" as created_at, "isActive" as is_active
        FROM "user"
        WHERE id = ${userId}
      `;
      
      if (users.length > 0) {
        return users[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  
  async updateUser(userId, updates) {
    // Basic implementation for compatibility
      try {
      const { name, email } = updates;
      
      await sql`
        UPDATE "user" 
        SET name = ${name}, email = ${email}, "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
