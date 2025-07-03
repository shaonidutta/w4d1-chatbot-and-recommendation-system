/**
 * Header Component with Search and Navigation
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text hidden sm:block">
                ShopHeart
              </span>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="search-bar flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent border-none outline-none placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="nav-item">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/recommendations" className="nav-item">
                  For You
                </Link>
                <Link to="/profile" className="nav-item flex items-center space-x-1">
                  <UserIcon className="w-5 h-5" />
                  <span>{user?.first_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Join Us
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Link
              to="/search"
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-white/20"
          >
            <div className="space-y-4">
              <Link
                to="/products"
                className="block nav-item py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/recommendations"
                    className="block nav-item py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    For You
                  </Link>
                  <Link
                    to="/profile"
                    className="block nav-item py-2 flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>{user?.first_name || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left nav-item py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block nav-item py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block btn-primary text-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
