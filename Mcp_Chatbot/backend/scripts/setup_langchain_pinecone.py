#!/usr/bin/env python3
"""
LangChain + Pinecone setup for MCP Q&A Chatbot.
Much simpler and more powerful than custom implementation.
"""

import os
import json
from typing import List
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv

# LangChain imports
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

class LangChainPineconeSetup:
    def __init__(self):
        # Configuration
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'mcp-knowledge-base')
        self.embedding_model = os.getenv('EMBEDDING_MODEL', 'text-embedding-3-small')
        self.embedding_dimension = int(os.getenv('EMBEDDING_DIMENSION', '1536'))
        self.environment = os.getenv('PINECONE_ENVIRONMENT', 'us-east-1-aws')
        
        # Initialize clients
        self.pinecone_client = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        self.embeddings = OpenAIEmbeddings(
            model=self.embedding_model,
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
        print(f"🔧 LangChain Configuration:")
        print(f"   Index Name: {self.index_name}")
        print(f"   Embedding Model: {self.embedding_model}")
        print(f"   Dimension: {self.embedding_dimension}")
    
    def check_api_keys(self):
        """Verify API keys are configured"""
        if not os.getenv('PINECONE_API_KEY'):
            print("❌ PINECONE_API_KEY not found in environment variables")
            return False
        if not os.getenv('OPENAI_API_KEY'):
            print("❌ OPENAI_API_KEY not found in environment variables")
            return False
        print("✅ API keys configured")
        return True
    
    def create_index(self):
        """Create Pinecone index if it doesn't exist"""
        try:
            existing_indexes = [index.name for index in self.pinecone_client.list_indexes()]
            
            if self.index_name in existing_indexes:
                print(f"✅ Index '{self.index_name}' already exists")
                return True
            
            print(f"🔨 Creating index '{self.index_name}'...")
            
            self.pinecone_client.create_index(
                name=self.index_name,
                dimension=self.embedding_dimension,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region='us-east-1'
                )
            )
            
            print(f"✅ Index '{self.index_name}' created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating index: {e}")
            return False
    
    def load_documents_from_langchain_processed(self, processed_path: str) -> List[Document]:
        """Load documents from LangChain processed data"""
        print("📚 Loading LangChain processed documents...")

        with open(processed_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        documents = []
        doc_data = data['documents']

        print(f"🔄 Loading {len(doc_data)} LangChain documents...")

        for i, doc_dict in enumerate(tqdm(doc_data, desc="Loading documents")):
            # Create LangChain Document from saved format
            doc = Document(
                page_content=doc_dict['page_content'],
                metadata=doc_dict['metadata']
            )
            documents.append(doc)

        print(f"✅ Loaded {len(documents)} LangChain documents")
        print(f"📊 Processing info: {data['metadata']}")
        return documents
    
    def upload_to_pinecone(self, documents: List[Document]):
        """Upload documents to Pinecone using LangChain in batches"""
        try:
            print(f"📤 Uploading {len(documents)} documents to Pinecone...")

            # Upload in batches to handle large datasets
            batch_size = 50
            vector_store = None

            for i in range(0, len(documents), batch_size):
                batch = documents[i:i+batch_size]
                batch_num = i//batch_size + 1
                total_batches = (len(documents)-1)//batch_size + 1

                print(f"  📦 Uploading batch {batch_num}/{total_batches} ({len(batch)} documents)...")

                if i == 0:
                    # First batch - create new vector store
                    vector_store = PineconeVectorStore.from_documents(
                        documents=batch,
                        embedding=self.embeddings,
                        index_name=self.index_name,
                        pinecone_api_key=os.getenv('PINECONE_API_KEY')
                    )
                else:
                    # Subsequent batches - add to existing
                    vector_store.add_documents(batch)

            print("✅ Documents uploaded successfully using LangChain!")
            return vector_store

        except Exception as e:
            print(f"❌ Error uploading documents: {e}")
            return None
    
    def test_retrieval(self, vector_store: PineconeVectorStore):
        """Test the retrieval functionality"""
        try:
            print("🔍 Testing retrieval...")
            
            test_query = "What is MCP and how does it work?"
            results = vector_store.similarity_search_with_score(test_query, k=3)
            
            print(f"📋 Search results for: '{test_query}'")
            for i, (doc, score) in enumerate(results):
                print(f"   {i+1}. Score: {score:.3f}")
                print(f"      Source: {doc.metadata['source_type']}")
                print(f"      Content: {doc.page_content[:100]}...")
                print()
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing retrieval: {e}")
            return False
    
    def setup_complete_pipeline(self):
        """Run the complete LangChain + Pinecone setup"""
        print("🚀 Starting LangChain + Pinecone Setup")
        print("=" * 50)
        
        # Step 1: Check API keys
        if not self.check_api_keys():
            return False
        
        # Step 2: Create index
        if not self.create_index():
            return False
        
        # Step 3: Load documents
        processed_path = "processed_data/langchain_documents_full.json"
        if not Path(processed_path).exists():
            print(f"❌ LangChain processed data not found at {processed_path}")
            print("Please run scripts/prepare_data_langchain.py first")
            return False

        documents = self.load_documents_from_langchain_processed(processed_path)
        if not documents:
            return False
        
        # Step 4: Upload to Pinecone
        vector_store = self.upload_to_pinecone(documents)
        if not vector_store:
            return False
        
        # Step 5: Test retrieval
        if not self.test_retrieval(vector_store):
            return False
        
        print("=" * 50)
        print("✅ LangChain + Pinecone setup completed successfully!")
        print(f"🎯 Your MCP knowledge base is ready at index: {self.index_name}")
        print("🔗 Next step: Use the LangChain RAG system for queries")
        print("\n📖 Usage example:")
        print("```python")
        print("from src.langchain_rag import MCPLangChainRAG")
        print("rag = MCPLangChainRAG()")
        print("result = rag.chat('How do I create an MCP server?')")
        print("print(result['response'])")
        print("```")
        
        return True

if __name__ == "__main__":
    setup = LangChainPineconeSetup()
    setup.setup_complete_pipeline()
