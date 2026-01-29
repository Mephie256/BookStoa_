# ✨ Better-Auth Integration - Complete Migration Guide

## 🎯 What Was Done

We've completely replaced your authentication system with **better-auth** - a modern, lightweight authentication library that uses email/password authentication with your PostgreSQL database via Drizzle ORM.

### ✅ Removed:
- ❌ **Clerk Authentication** - All Clerk packages and components removed
- ❌ **Auth.js/NextAuth** - Removed from backend
- ❌ **Appwrite** - Authentication service removed  
- ❌ **Google OAuth** - No third-party OAuth providers
- ❌ **Separate Backend Server** - No need to run `/backend` server!

### ✨ Added:
- ✅ **better-auth** with email/password authentication
- ✅ **Drizzle ORM adapter** for PostgreSQL (Neon)
- ✅ **Vite middleware** - Auth endpoints run within Vite dev server
- ✅ **Clean authentication context** - Simple, easy-to-use API
- ✅ **Admin role management** - Based on email configuration

---

## 🚀 How To Run

### Single Command Setup:
```bash
npm run dev
```

That's it! Everything runs in one process. No separate backend server needed!

---

## 📁 File Structure

### **New/Modified Files:**

#### **Authentication Core:**
- `src/lib/auth.js` - Better-auth server configuration
- `src/contexts/BetterAuthContext.jsx` - React context for auth
- `vite.config.js` - Vite middleware for `/api/auth/*` endpoints

#### **Database:**
- `src/lib/db/schema.js` - Updated with better-auth tables
- `migrate-better-auth.js` - Migration script (already run)

#### **Configuration:**
- `.env` - Already has `VITE_BETTER_AUTH_SECRET` and `VITE_ADMIN_EMAIL`

---

## 🔐 How Authentication Works

### **1. Registration (Sign Up)**
```jsx
const { register } = useAuth();

const result = await register({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe'
});

if (result.success) {
  // User registered and logged in
}
```

### **2. Login (Sign In)**
```jsx
const { login } = useAuth();

const result = await login('user@example.com', 'password');

if (result.success) {
  // User logged in
}
```

### **3. Logout**
```jsx
const { logout } = useAuth();

await logout();
```

### **4. Check Authentication State**
```jsx
const { user, loading, isAdmin } = useAuth();

if (loading) return <div>Loading...</div>;

if (user) {
  return <div>Welcome, {user.name}!</div>;
}
```

---

## 👤 Admin Role Management

**Admin role is automatically assigned based on email:**

In `.env`:
```
VITE_ADMIN_EMAIL=admin@pneumabookstore.com
```

When a user registers with this email, they automatically get the `admin` role.

Check if user is admin:
```jsx
const { isAdmin } = useAuth();

if (isAdmin) {
  // Show admin features
}
```

---

## 🔌 API Endpoints

All authentication endpoints are automatically handled at `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Register with email/password
- `POST /api/auth/sign-in/email` - Login with email/password  
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- And more...

**You don't need to create these endpoints - better-auth handles them automatically!**

---

## 📊 Database Schema

### **Better-Auth Tables:**

#### `user` table:
- `id` (text, primary key)
- `name` (text)
- `email` (text, unique)
- `emailVerified` (boolean)
- `image` (text, nullable)
- `role` (text, default: 'user')  ← **Custom field for admin management**
- `isActive` (boolean, default: true)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### `session` table:
- `id` (text, primary key)
- `expiresAt` (timestamp)
- `ipAddress` (text)
- `userAgent` (text)
- `userId` (text, foreign key → user.id)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### `account` table:
- `id` (text, primary key)
- `accountId` (text)
- `providerId` (text)
- `userId` (text, foreign key → user.id)
- `password` (text) ← **Hashed password**
- `accessToken`, `refreshToken`, `idToken` (for future OAuth)
- `expiresAt` (timestamp)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### `verification` table:
- `id` (text, primary key)
- `identifier` (text)
- `value` (text)
- `expiresAt` (timestamp)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### **Your Application Tables:**
All tables (`favorites`, `downloads`, `book_ratings`, `reading_progress`) now reference the new `user` table instead of the old `users` table.

---

##🛠️ Environment Variables

Already configured in `.env`:

```env
# Better-Auth Configuration
VITE_BETTER_AUTH_SECRET=1wXrEmf0PNnw5enL41WXuRkIv9SwBWa6
VITE_BETTER_AUTH_URL=http://localhost:5173

# Admin Configuration
VITE_ADMIN_EMAIL=admin@pneumabookstore.com

# Database (Already configured)
DATABASE_URL=postgresql://...
```

---

## 🎨 Example: Update Your Auth Modal

Your auth modal should now use the new auth context:

```jsx
import { useAuth } from '../contexts/BetterAuthContext';

function AuthModal() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (isLogin) {
      const result = await login(
        formData.get('email'),
        formData.get('password')
      );
      
      if (result.success) {
        // Close modal, show success
      } else {
        // Show error: result.error
      }
    } else {
      const result = await register({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
      });
      
      if (result.success) {
        // Close modal, show success
      } else {
        // Show error: result.error
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isLogin && (
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
        />
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
      />
      <button type="submit">
        {isLogin ? 'Login' : 'Register'}
      </button>
      <button type="button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account?' : 'Already have an account?'}
      </button>
    </form>
  );
}
```

---

## 🧹 Clean Up (Optional)

You can safely delete these files/folders:
- `backend/` - No longer needed!
- `api/auth/[...all].js` - Not used
- `src/contexts/SimpleAuthContext.jsx` - Replaced
- `src/contexts/AuthContext.jsx` - Old Appwrite auth
- `src/lib/appwrite.js` - Not needed
- `src/services/appwrite/` - Not needed
- `src/components/ClerkTestModal.jsx` - Clerk component
- `src/components/ClerkDebug.jsx` - Clerk component

---

## ✅ Next Steps

1. **Test the authentication:**
   ```bash
   npm run dev
   ```

2. **Update your auth UI components** to use `useAuth()` from `BetterAuthContext`

3. **Remove any Clerk/Appwrite/Auth.js imports** from your components

4. **Test the admin flow:**
   - Register with the admin email
   - Verify admin features appear

---

## 🐛 Troubleshooting

### Issue: "Module not found: better-auth"
**Solution:** Run `npm install`

### Issue: "Database connection failed"
**Solution:** Check your `DATABASE_URL` in `.env`

### Issue: "Auth endpoints not responding"
**Solution:** Make sure Vite dev server is running (`npm run dev`)

### Issue: "Session not persisting"
**Solution:** Check that `VITE_BETTER_AUTH_SECRET` is set in `.env`

---

## 📚 Resources

- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Better-Auth with Drizzle](https://www.better-auth.com/docs/adapters/drizzle)
- [Better-Auth React Client](https://www.better-auth.com/docs/installation#create-client-instance)

---

## 🎉 Summary

**You now have:**
- ✅ Clean, modern authentication with better-auth
- ✅ Email/password login and registration
- ✅ Admin role management based on email
- ✅ Everything runs in one `npm run dev` command
- ✅ No separate backend server needed!
- ✅ PostgreSQL database via Drizzle ORM
- ✅ Secure session management

**Just run `npm run dev` and start building! 🚀**
