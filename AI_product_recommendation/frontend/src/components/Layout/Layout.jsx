/**
 * Main Layout Component with Navigation
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';

const Layout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-girly">
        <LoadingSpinner size="large" text="Loading your experience..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-girly">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        <Outlet />
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
