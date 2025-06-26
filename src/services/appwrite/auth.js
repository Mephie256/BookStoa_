import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '../../lib/appwrite';
import { ID } from 'appwrite';

export class AuthService {
    // Admin email - change this to your desired admin email
    getAdminEmail() {
        return import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
    }

    // Create account (users and admin)
    async createAccount(email, password, name) {
        try {
            const userAccount = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            // Determine role based on email
            const isAdminEmail = email.toLowerCase() === this.getAdminEmail().toLowerCase();
            const role = isAdminEmail ? 'admin' : 'user';

            // Create user profile in database
            await databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userAccount.$id,
                {
                    name,
                    email,
                    role,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            return userAccount;
        } catch (error) {
            console.error('Error creating account:', error);
            throw new Error(error.message || 'Failed to create account');
        }
    }

    // Login
    async login(email, password) {
        try {
            const session = await account.createEmailSession(email, password);
            return session;
        } catch (error) {
            console.error('Error logging in:', error);
            throw new Error(error.message || 'Failed to login');
        }
    }

    // Logout
    async logout() {
        try {
            await account.deleteSession('current');
            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            throw new Error('Failed to logout');
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const user = await account.get();

            // Get user profile from database
            try {
                const userProfile = await databases.getDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    user.$id
                );

                return {
                    ...user,
                    profile: userProfile
                };
            } catch (profileError) {
                // If profile doesn't exist, create it
                const profile = await databases.createDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    user.$id,
                    {
                        name: user.name,
                        email: user.email,
                        role: 'user',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );

                return {
                    ...user,
                    profile
                };
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Update user profile
    async updateProfile(userId, updateData) {
        try {
            const updatedProfile = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                {
                    ...updateData,
                    updatedAt: new Date().toISOString()
                }
            );

            return updatedProfile;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error('Failed to update profile');
        }
    }

    // Check if user is admin (based on email and role)
    async isAdmin() {
        try {
            const user = await this.getCurrentUser();
            if (!user) return false;

            // Check both role and email for extra security
            const isAdminRole = user.profile?.role === 'admin';
            const isAdminEmail = user.email?.toLowerCase() === this.getAdminEmail().toLowerCase();

            return isAdminRole && isAdminEmail;
        } catch (error) {
            return false;
        }
    }



    // Reset password
    async resetPassword(email) {
        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
            return { success: true };
        } catch (error) {
            console.error('Error sending password reset:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    // Complete password reset
    async completePasswordReset(userId, secret, password) {
        try {
            await account.updateRecovery(userId, secret, password, password);
            return { success: true };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw new Error('Failed to reset password');
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        try {
            const isAdminUser = await this.isAdmin();
            if (!isAdminUser) {
                throw new Error('Unauthorized: Admin access required');
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID
            );

            return response.documents;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    // Update user role (admin only)
    async updateUserRole(userId, role) {
        try {
            const isAdminUser = await this.isAdmin();
            if (!isAdminUser) {
                throw new Error('Unauthorized: Admin access required');
            }

            const updatedUser = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                {
                    role,
                    updatedAt: new Date().toISOString()
                }
            );

            return updatedUser;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw new Error('Failed to update user role');
        }
    }

    // Delete user (admin only)
    async deleteUser(userId) {
        try {
            const isAdminUser = await this.isAdmin();
            if (!isAdminUser) {
                throw new Error('Unauthorized: Admin access required');
            }

            await databases.deleteDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId
            );

            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }
}

export const authService = new AuthService();
