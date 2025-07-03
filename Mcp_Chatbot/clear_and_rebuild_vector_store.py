#!/usr/bin/env python3
"""
Clear and rebuild the Pinecone vector store with fresh data
"""

import os
import sys
from pathlib import Path

# Add the backend src directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir / "src"))

from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
import json

def clear_and_rebuild():
    """Clear the vector store and rebuild with fresh data"""
    
    # Load environment variables
    from dotenv import load_dotenv
    # Load from backend directory
    env_path = backend_dir / ".env"
    load_dotenv(env_path)
    
    # Initialize Pinecone
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "mcp-knowledge-base"
    
    print("🗑️  Clearing existing vector store...")
    
    # Get the index
    index = pc.Index(index_name)
    
    # Delete all vectors
    index.delete(delete_all=True)
    print("✅ Vector store cleared!")
    
    # Wait a moment for the deletion to propagate
    import time
    time.sleep(2)
    
    print("🔄 Rebuilding vector store with fresh data...")
    
    # Load the processed documents
    processed_file = backend_dir / "processed_data" / "langchain_documents.json"
    
    if not processed_file.exists():
        print("❌ No processed documents found. Run prepare_data_langchain.py first!")
        return
    
    with open(processed_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    documents = data['documents']
    print(f"📚 Loading {len(documents)} documents...")
    
    # Convert to LangChain Document format
    from langchain.schema import Document
    
    langchain_docs = []
    for doc_data in documents:
        doc = Document(
            page_content=doc_data['page_content'],
            metadata=doc_data['metadata']
        )
        langchain_docs.append(doc)
    
    # Initialize embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Create vector store and add documents
    vector_store = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="text"
    )
    
    # Add documents in batches
    batch_size = 50
    for i in range(0, len(langchain_docs), batch_size):
        batch = langchain_docs[i:i + batch_size]
        vector_store.add_documents(batch)
        print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(langchain_docs) + batch_size - 1)//batch_size}")
    
    print("🎉 Vector store rebuilt successfully!")
    
    # Test the new vector store
    print("🔍 Testing retrieval...")
    results = vector_store.similarity_search("MCP server connection issues", k=3)
    
    print("📋 Test results:")
    for i, result in enumerate(results):
        source_name = result.metadata.get('original_source', 'Unknown')
        print(f"   {i+1}. {source_name}")
        print(f"      Content: {result.page_content[:100]}...")
    
    print("✅ Rebuild complete!")

if __name__ == "__main__":
    clear_and_rebuild()
