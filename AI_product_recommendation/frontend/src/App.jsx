import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Search from './pages/Search';
import TestAuth from './pages/TestAuth';

// App Content Component (needs to be inside AuthProvider to use useAuth)
const AppContent = () => {
  const { isLoading } = useAuth();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-girly flex items-center justify-center">
        <LoadingSpinner
          size="large"
          text="Loading your personalized experience..."
          showText={true}
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-girly">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-auth" element={<TestAuth />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="search" element={<Search />} />

            {/* User-specific protected routes */}
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="recommendations" element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider position="top-right" maxToasts={3}>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
