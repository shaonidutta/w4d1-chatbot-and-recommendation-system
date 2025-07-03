/**
 * User Profile Page
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  HeartIcon, 
  EyeIcon, 
  ShoppingBagIcon,
  PencilIcon,
  KeyIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, apiUtils } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [userPreferences, setUserPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      setIsLoading(true);
      const preferences = await usersAPI.getPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      await usersAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to change password' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mb-4">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600">
            Manage your account and view your activity
          </p>
        </motion.div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-mint-50 border border-mint-200 text-mint-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-ghost flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        className="input-girly w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        className="input-girly w-full"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="input-girly w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="input-girly w-full"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-800 font-medium">{user?.first_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-800 font-medium">{user?.last_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Username
                    </label>
                    <p className="text-gray-800 font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-800 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-800 font-medium">
                      {user?.created_at ? apiUtils.formatDate(user.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Password Change Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Password & Security</h2>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="btn-ghost flex items-center space-x-2"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Cancel' : 'Change Password'}</span>
                </button>
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="input-girly w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="input-girly w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="input-girly w-full"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Keep your account secure by using a strong password and changing it regularly.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Last login: {user?.last_login ? apiUtils.formatDate(user.last_login) : 'Never'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Activity Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Activity</h2>
              
              {userPreferences ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <HeartIcon className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Liked Products</span>
                    </div>
                    <span className="font-semibold text-primary-600">
                      {userPreferences.interaction_stats?.liked_products || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <EyeIcon className="w-5 h-5 text-accent-600" />
                      <span className="text-gray-700">Viewed Products</span>
                    </div>
                    <span className="font-semibold text-accent-600">
                      {userPreferences.interaction_stats?.viewed_products || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-coral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <ShoppingBagIcon className="w-5 h-5 text-coral-600" />
                      <span className="text-gray-700">Purchases</span>
                    </div>
                    <span className="font-semibold text-coral-600">
                      {userPreferences.interaction_stats?.purchases || 0}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Loading activity stats...</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/recommendations'}
                  className="w-full btn-secondary text-left"
                >
                  View My Recommendations
                </button>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="w-full btn-secondary text-left"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => window.location.href = '/search'}
                  className="w-full btn-secondary text-left"
                >
                  Search Products
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
