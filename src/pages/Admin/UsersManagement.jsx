import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Search, Filter, User, Mail, Calendar, Download, Shield } from 'lucide-react';
import { Aurora } from '../../components/ui/aurora';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/SimpleAuthContext';
import LoaderOne from '../../components/ui/loader-one';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const { user, isAdmin } = useAuth();

  // Load real users from database
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return;

      setLoading(true);
      try {
        console.log('👥 Admin loading users from database...');
        const usersData = await authService.getAllUsers();
        console.log('👥 Admin loaded', usersData.length, 'users from database:', usersData);

        setUsers(usersData);

        if (usersData.length === 0) {
          console.log('⚠️ No users found in database');
        }
      } catch (error) {
        console.error('❌ Error loading users from database:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin]);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-600/20 text-green-400'
      : 'bg-gray-600/20 text-gray-400';
  };

  const getRoleColor = (role) => {
    return role === 'admin'
      ? 'bg-blue-600/20 text-blue-400'
      : 'bg-gray-600/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark Aurora Background - Full Coverage */}
      <div className="fixed inset-0 w-full h-full opacity-50 z-0">
        <Aurora
          colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
          blend={0.4}
          amplitude={0.6}
          speed={0.12}
          className="w-full h-full"
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 relative z-20">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="flex items-center gap-2 transition-colors mr-4 hover:opacity-80 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50"
            style={{color: '#11b53f'}}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Users Management</h1>
            <p className="text-gray-300 mt-1">Manage all users and their activities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="all" className="bg-gray-800">All Status</option>
                  <option value="active" className="bg-gray-800">Active</option>
                  <option value="inactive" className="bg-gray-800">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              All Users ({loading ? '...' : filteredUsers.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <LoaderOne />
              <p className="text-gray-300 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
              <p className="text-gray-400">
                {searchTerm || filterStatus !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 hover:bg-gray-600/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{user.name || user.email.split('@')[0]}</h3>
                        {user.role === 'admin' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            <Shield className="w-3 h-3 inline mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {new Date(user.created_at || user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.last_login && (
                          <div className="flex items-center gap-1">
                            <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.updated_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Updated: {new Date(user.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <button
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-gray-600/30"
                      title="View User Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-green-400">{users.length}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-blue-400">
              {users.filter(user => user.is_active).length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Admin Users</h3>
            <p className="text-3xl font-bold text-purple-400">
              {users.filter(user => user.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
