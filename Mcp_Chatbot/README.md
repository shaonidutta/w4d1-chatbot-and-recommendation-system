# 🤖 MCP Q&A Chatbot

A sophisticated Q&A chatbot specialized in Model Context Protocol (MCP) with enhanced RAG (Retrieval-Augmented Generation) capabilities, beautiful animations, and modern UI.

## ✨ Features

### 🎯 **Core Functionality**
- **Expert MCP Knowledge**: Comprehensive understanding of Model Context Protocol
- **Enhanced RAG System**: Multi-strategy retrieval with 0.8+ similarity scores
- **Specialized Chat Types**: General, Implementation, Troubleshooting, Concepts
- **Source Attribution**: Shows which documents were used in responses
- **Real-time Responses**: Fast, accurate answers with token usage tracking

### 🎨 **Beautiful UI/UX**
- **Smooth Animations**: Three.js background with floating geometric shapes
- **Gentle Hover Effects**: Soft shadows and scale transforms
- **Subtle Gradients**: Elegant color transitions throughout
- **Glass Morphism**: Modern backdrop blur effects
- **Responsive Design**: Works perfectly on mobile and desktop

### 🔧 **Advanced Features**
- **Chat History**: Save and load previous conversations
- **Settings Panel**: Customize appearance and behavior
- **Quick Questions**: Pre-defined MCP topic buttons
- **Error Handling**: Graceful fallbacks and connection monitoring
- **Export Functionality**: Download chat sessions as JSON

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Pinecone account
- OpenAI API key

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements-vector.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Process data
python scripts/prepare_data_langchain.py

# Setup vector database
python scripts/setup_langchain_pinecone.py

# Start API server
python src/api.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
QnA Chatbot-MCP Server/
├── 📁 backend/                    # Backend API & RAG system
│   ├── 📁 src/                    
│   │   ├── 📄 langchain_rag.py    # Enhanced RAG system
│   │   └── 📄 api.py              # FastAPI server
│   ├── 📁 scripts/                # Data processing scripts
│   └── 📄 .env                    # API keys (secured)
├── 📁 frontend/                   # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/         # UI components
│   │   ├── 📁 utils/              # API utilities
│   │   └── 📄 App.jsx             # Main application
│   └── 📄 package.json
├── 📁 data/                       # Knowledge base source
├── 📁 processed_data/             # LangChain processed chunks
└── 📄 README.md                   # This file
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=mcp-knowledge-base

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini

# Chat Configuration
MAX_TOKENS=1000
TEMPERATURE=0.7
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_THREE_BACKGROUND=true
VITE_ENABLE_ANIMATIONS=true
```

## 🎯 Usage Examples

### Basic Chat
```javascript
// Send a general question
POST /chat
{
  "query": "What is MCP?",
  "chat_type": "general"
}
```

### Implementation Help
```javascript
// Get implementation guidance
POST /chat
{
  "query": "How do I create an MCP server?",
  "chat_type": "implementation"
}
```

### Troubleshooting
```javascript
// Get troubleshooting help
POST /chat
{
  "query": "My MCP server won't connect",
  "chat_type": "troubleshooting"
}
```

## 📊 Performance Metrics

- **Response Time**: 3-5 seconds average
- **Retrieval Quality**: 0.8+ similarity scores
- **Cost per Query**: ~$0.60
- **Knowledge Base**: 278 high-quality chunks
- **Topics Covered**: 8 main MCP areas

## 🛠️ Development

### Adding New Content
1. Add markdown files to `data/curated-content/`
2. Run `python scripts/prepare_data_langchain.py`
3. Run `python scripts/setup_langchain_pinecone.py`

### Customizing UI
- Edit components in `frontend/src/components/`
- Modify animations in `frontend/src/components/ThreeBackground.jsx`
- Update styles in `frontend/src/index.css`

### API Endpoints
- `POST /chat` - Main chat functionality
- `GET /health` - System health check
- `GET /topics` - Available question topics
- `POST /search` - Direct document search

## 🔒 Security

- ✅ API keys stored in environment variables only
- ✅ CORS properly configured
- ✅ Input validation with Pydantic
- ✅ Error handling without exposing internals
- ✅ Rate limiting ready for production

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
# Set environment variables
# Deploy backend/ folder
```

## 📈 Monitoring

- **Health Endpoint**: `/health`
- **System Stats**: `/stats`
- **Token Usage**: Tracked per request
- **Error Logging**: Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **LangChain**: For the excellent RAG framework
- **Pinecone**: For the vector database
- **OpenAI**: For embeddings and chat completions
- **Three.js**: For beautiful 3D animations
- **Tailwind CSS**: For the styling system

---

**Built with ❤️ for the MCP community**
