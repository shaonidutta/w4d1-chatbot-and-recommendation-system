# MCP Knowledge Base Data Sources

This folder contains the knowledge base for the MCP Q&A Chatbot.

## Data Sources Structure

### 1. Official Documentation (`official-docs/`)
- Scraped from https://modelcontextprotocol.io/
- Contains the most up-to-date and authoritative information
- Automatically updated content

### 2. Curated Markdown (`curated-content/`)
- Hand-written explanations and examples
- Simplified concepts for beginners
- Custom tutorials and best practices
- FAQ based on common developer questions

### 3. Code Examples (`examples/`)
- Working code samples
- Implementation patterns
- Real-world use cases

## Processing Pipeline
1. Parse all markdown files
2. Chunk content into 500-1000 token pieces
3. Generate embeddings for each chunk
4. Store in vector database for retrieval

## Update Strategy
- Official docs: Scrape weekly
- Curated content: Manual updates as needed
- Examples: Add new patterns as discovered
