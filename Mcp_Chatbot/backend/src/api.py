"""
FastAPI backend for MCP Q&A Chatbot using LangChain.
Provides REST API endpoints for the chat functionality.
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from langchain_rag import MCPLangChainRAG, MCPSpecializedChains

# Load environment variables from backend/.env
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

# Initialize FastAPI app
app = FastAPI(
    title="MCP Q&A Chatbot API",
    description="LangChain-powered API for MCP (Model Context Protocol) questions",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
try:
    rag_system = MCPLangChainRAG()
    specialized_chains = MCPSpecializedChains(rag_system)
    print("✅ RAG system initialized successfully")
except Exception as e:
    print(f"❌ Error initializing RAG system: {e}")
    rag_system = None
    specialized_chains = None

# Pydantic models for request/response
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    query: str
    response: str
    timestamp: str
    chat_type_detected: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    vector_store_healthy: bool
    llm_healthy: bool
    index_name: str
    timestamp: str

class SearchRequest(BaseModel):
    query: str
    k: Optional[int] = 5

class SearchResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    timestamp: str

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "MCP Q&A Chatbot API",
        "version": "1.0.0",
        "powered_by": "LangChain + Pinecone + OpenAI",
        "endpoints": {
            "chat": "/chat",
            "search": "/search", 
            "health": "/health",
            "topics": "/topics"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint with simplified response"""
    if not rag_system:
        raise HTTPException(status_code=500, detail="RAG system not initialized")

    try:
        # Use enhanced LangChain RAG with auto-detection
        result = rag_system.chat(request.query, k=5)
        response_text = result['response']
        detected_type = result.get('chat_type_detected', 'general')

        return ChatResponse(
            query=request.query,
            response=response_text,
            timestamp=datetime.now().isoformat(),
            chat_type_detected=detected_type
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Direct similarity search without LLM generation"""
    if not rag_system:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        results = rag_system.similarity_search(request.query, k=request.k)
        
        return SearchResponse(
            query=request.query,
            results=results,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing search request: {str(e)}")

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    if not rag_system:
        return HealthResponse(
            status="unhealthy",
            vector_store_healthy=False,
            llm_healthy=False,
            index_name="unknown",
            timestamp=datetime.now().isoformat()
        )
    
    try:
        health_status = rag_system.get_health_status()
        
        overall_status = "healthy" if (
            health_status.get('vector_store_healthy', False) and 
            health_status.get('llm_healthy', False)
        ) else "unhealthy"
        
        return HealthResponse(
            status=overall_status,
            vector_store_healthy=health_status.get('vector_store_healthy', False),
            llm_healthy=health_status.get('llm_healthy', False),
            index_name=health_status.get('index_name', 'unknown'),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking health: {str(e)}")

@app.get("/topics")
async def get_topics():
    """Get available MCP topics for quick questions"""
    return {
        "topics": [
            {
                "category": "Basics",
                "questions": [
                    "What is MCP?",
                    "How does MCP work?",
                    "MCP vs other protocols",
                    "MCP architecture overview"
                ]
            },
            {
                "category": "Implementation", 
                "questions": [
                    "How to create an MCP server?",
                    "How to connect MCP client?",
                    "MCP server examples",
                    "Authentication in MCP"
                ]
            },
            {
                "category": "Concepts",
                "questions": [
                    "What are MCP resources?",
                    "What are MCP tools?",
                    "What are MCP prompts?",
                    "MCP transports explained"
                ]
            },
            {
                "category": "Troubleshooting",
                "questions": [
                    "MCP connection issues",
                    "Common MCP errors",
                    "Debugging MCP servers",
                    "Performance optimization"
                ]
            }
        ]
    }

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    if not rag_system:
        return {"error": "RAG system not initialized"}
    
    try:
        # Get some basic stats
        health_status = rag_system.get_health_status()
        
        return {
            "system_status": health_status,
            "available_endpoints": [
                "/chat", "/search", "/health", "/topics", "/stats"
            ],
            "auto_detection": "Chat type is automatically detected based on query content",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": f"Error getting stats: {str(e)}"}

# Run the server
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting MCP Q&A API server on {host}:{port}")
    print(f"📖 API docs available at: http://{host}:{port}/docs")
    
    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
