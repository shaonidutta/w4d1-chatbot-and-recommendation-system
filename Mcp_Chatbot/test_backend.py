#!/usr/bin/env python3
"""
Test script to verify backend functionality
"""

import sys
import os
sys.path.append('backend')

def test_imports():
    """Test if all imports work"""
    try:
        print("Testing imports...")
        
        # Test basic imports
        from dotenv import load_dotenv
        print("✅ dotenv imported")
        
        load_dotenv('backend/.env')
        print("✅ Environment loaded")
        
        # Test LangChain imports
        from langchain_openai import OpenAIEmbeddings, ChatOpenAI
        print("✅ LangChain OpenAI imported")
        
        from langchain_pinecone import PineconeVectorStore
        print("✅ LangChain Pinecone imported")
        
        # Test API keys
        pinecone_key = os.getenv('PINECONE_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if pinecone_key:
            print(f"✅ Pinecone API key found: {pinecone_key[:10]}...")
        else:
            print("❌ Pinecone API key not found")
            
        if openai_key:
            print(f"✅ OpenAI API key found: {openai_key[:10]}...")
        else:
            print("❌ OpenAI API key not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_rag_system():
    """Test RAG system initialization"""
    try:
        print("\nTesting RAG system...")
        
        from backend.src.langchain_rag import MCPLangChainRAG
        
        rag = MCPLangChainRAG()
        print("✅ RAG system initialized")
        
        # Test health
        health = rag.get_health_status()
        print(f"✅ Health check: {health}")
        
        return True
        
    except Exception as e:
        print(f"❌ RAG system error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_query():
    """Test a simple query"""
    try:
        print("\nTesting simple query...")
        
        from backend.src.langchain_rag import MCPLangChainRAG
        
        rag = MCPLangChainRAG()
        result = rag.chat("What is MCP?")
        
        print(f"✅ Query successful")
        print(f"Response: {result['response'][:100]}...")
        print(f"Sources: {len(result.get('sources', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Query error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing Backend Components")
    print("=" * 50)
    
    success = True
    
    success &= test_imports()
    success &= test_rag_system()
    success &= test_simple_query()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ All tests passed! Backend is ready.")
    else:
        print("❌ Some tests failed. Check the errors above.")
