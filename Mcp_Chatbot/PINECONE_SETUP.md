# 🚀 LangChain + Pinecone Vector Database Setup Guide

## Prerequisites

### 1. Get API Keys

#### Pinecone API Key:
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign up/Login
3. Create a new project
4. Copy your API key from the dashboard
5. Note your environment (e.g., `us-east-1-aws`)

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Install Dependencies

```bash
pip install -r requirements-vector.txt
```

### 3. Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your API keys:
```env
# Pinecone Configuration
PINECONE_API_KEY=your_actual_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1-aws

# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key

# Index Configuration (you can keep these defaults)
PINECONE_INDEX_NAME=mcp-knowledge-base
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

## 🔧 Setup Process

### Step 1: Run LangChain + Pinecone Setup
```bash
python scripts/setup_langchain_pinecone.py
```

This will:
- ✅ Verify your API keys
- 🔨 Create Pinecone index
- 📚 Load LangChain processed documents (278 chunks)
- 🔄 Generate embeddings using LangChain
- 📤 Upload vectors to Pinecone with rich metadata
- 🔍 Test search functionality

### Step 2: Verify Setup
The script will show output like:
```
🚀 Starting LangChain + Pinecone Setup
==================================================
✅ API keys configured
✅ Index 'mcp-knowledge-base' created successfully
📚 Loading LangChain processed documents...
🔄 Loading 278 LangChain documents...
Loading documents: 100%|████████████| 278/278
✅ Loaded 278 LangChain documents
📤 Uploading 278 documents to Pinecone...
✅ Documents uploaded successfully using LangChain!
🔍 Testing retrieval...
📋 Search results for: 'What is MCP and how does it work?'
   1. Score: 0.856
      Source: official_docs
      Content: MCP is an open protocol that standardizes how applications provide context to LLMs...
==================================================
✅ LangChain + Pinecone setup completed successfully!
```

## 🧪 Test Your Setup

### Test LangChain RAG System:
```bash
python src/langchain_rag.py
```

### Test with Custom Query:
```python
from src.langchain_rag import MCPLangChainRAG

rag = MCPLangChainRAG()
result = rag.chat("How do I create an MCP server?")
print(result['response'])
```

## 📊 Monitoring & Management

### Check Index Stats:
```python
from pinecone import Pinecone
import os

pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index('mcp-knowledge-base')
stats = index.describe_index_stats()
print(f"Total vectors: {stats['total_vector_count']}")
```

### Update Knowledge Base:
1. Add new content to `data/` folders
2. Run `python scripts/prepare_data_langchain.py`
3. Run `python scripts/setup_langchain_pinecone.py` (will update existing vectors)

## 💰 Cost Considerations

### Pinecone Costs:
- **Starter Plan**: Free (1 index, 100K vectors)
- **Standard Plan**: $70/month (5 indexes, unlimited vectors)

### OpenAI Costs:
- **Embeddings**: ~$0.0001 per 1K tokens
- **Chat**: ~$0.0015 per 1K tokens (GPT-4o-mini)

**Estimated monthly cost for this project**: $5-15 depending on usage

## 🔧 Troubleshooting

### Common Issues:

1. **"Index not found"**
   - Check index name in `.env`
   - Verify Pinecone dashboard

2. **"API key invalid"**
   - Double-check API keys in `.env`
   - Ensure no extra spaces

3. **"Rate limit exceeded"**
   - Script includes delays
   - Wait and retry

4. **"Dimension mismatch"**
   - Ensure embedding model matches dimension
   - Default: `text-embedding-3-small` = 1536 dimensions

### Get Help:
- Check Pinecone documentation
- Review OpenAI API status
- Verify environment variables

## ✅ Success Checklist

- [ ] Pinecone account created
- [ ] OpenAI account created  
- [ ] API keys configured in `.env`
- [ ] Dependencies installed
- [ ] `setup_langchain_pinecone.py` runs successfully
- [ ] Test search returns relevant results
- [ ] RAG system responds to queries

**Next Step**: Build the FastAPI backend to serve the RAG system!
