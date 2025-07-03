#!/usr/bin/env python3
"""
Test script for authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_registration():
    """Test user registration"""
    print("Testing user registration...")
    
    registration_data = {
        "username": "testuser123",
        "email": "test@example.com", 
        "password": "TestPass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return response.json()
        else:
            print("❌ Registration failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return None

def test_login():
    """Test user login"""
    print("\nTesting user login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "TestPass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json()
        else:
            print("❌ Login failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def test_health():
    """Test if backend is running"""
    print("Testing backend health...")
    
    try:
        response = requests.get(f"http://localhost:8000/health")
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Authentication System\n")
    
    # Test backend health first
    if not test_health():
        print("❌ Backend is not running. Please start the backend first.")
        exit(1)
    
    # Test registration
    user_data = test_registration()
    
    # Test login
    login_result = test_login()
    
    print("\n🏁 Test completed!")
