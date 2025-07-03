/**
 * Test Authentication Page for Debugging
 */
import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const TestAuth = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const userData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123',
        first_name: 'Test',
        last_name: 'User'
      };

      console.log('Sending registration data:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      setResult(`✅ Registration successful! User ID: ${response.user_id}`);
    } catch (error) {
      console.error('Registration error:', error);
      setResult(`❌ Registration failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const credentials = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      console.log('Sending login data:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      setResult(`✅ Login successful! User: ${response.user.username}`);
    } catch (error) {
      console.error('Login error:', error);
      setResult(`❌ Login failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setLoading(true);
    setResult('Testing backend health...');

    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      console.log('Health response:', data);

      setResult(`✅ Backend is healthy: ${data.status}`);
      showSuccess('Backend is running perfectly!', { title: 'Health Check' });
    } catch (error) {
      console.error('Health check error:', error);
      setResult(`❌ Backend health check failed: ${error.message}`);
      showError('Backend health check failed', { title: 'Connection Error' });
    } finally {
      setLoading(false);
    }
  };

  const testToasts = () => {
    showSuccess('This is a success toast! 🎉', { title: 'Success Test' });
    setTimeout(() => {
      showError('This is an error toast! ❌', { title: 'Error Test' });
    }, 1000);
    setTimeout(() => {
      showWarning('This is a warning toast! ⚠️', { title: 'Warning Test' });
    }, 2000);
    setTimeout(() => {
      showInfo('This is an info toast! ℹ️', { title: 'Info Test' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testBackendHealth}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Backend Health
          </button>

          <button
            onClick={testRegistration}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Registration
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Login (with existing user)
          </button>

          <button
            onClick={testToasts}
            disabled={loading}
            className="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 disabled:opacity-50"
          >
            Test Toast Notifications
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {loading ? 'Loading...' : result || 'Click a button to test'}
          </pre>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Open browser console (F12) to see detailed logs.</p>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
