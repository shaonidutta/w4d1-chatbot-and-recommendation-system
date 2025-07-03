#!/usr/bin/env python3
"""
LangChain-powered data preparation script for MCP Q&A Chatbot.
Uses intelligent text splitters for optimal chunking and document processing.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# LangChain imports
from langchain.schema import Document
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
    TokenTextSplitter
)
from langchain.document_loaders import (
    DirectoryLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)

class LangChainDataProcessor:
    def __init__(self, data_dir="data", output_dir="processed_data"):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize different text splitters for different content types
        self.setup_text_splitters()
        
        print("🔧 LangChain Data Processor initialized")
        print(f"   Data directory: {self.data_dir}")
        print(f"   Output directory: {self.output_dir}")
    
    def setup_text_splitters(self):
        """Initialize various LangChain text splitters"""
        
        # 1. Recursive Character Text Splitter (best for general text)
        self.recursive_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # 2. Markdown Header Text Splitter (preserves structure)
        self.markdown_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "Header 1"),
                ("##", "Header 2"), 
                ("###", "Header 3"),
                ("####", "Header 4"),
            ]
        )
        
        # 3. Token-based splitter (for precise token control)
        self.token_splitter = TokenTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )
        
        print("✅ Text splitters configured:")
        print("   - RecursiveCharacterTextSplitter (general)")
        print("   - MarkdownHeaderTextSplitter (structure-aware)")
        print("   - TokenTextSplitter (token-precise)")
    
    def load_documents_from_directory(self, directory: Path, source_type: str) -> List[Document]:
        """Load documents from directory using LangChain loaders"""
        if not directory.exists():
            print(f"⚠️  Directory {directory} does not exist, skipping...")
            return []
        
        print(f"📂 Loading documents from {directory} ({source_type})")
        
        try:
            # Use DirectoryLoader for markdown files
            loader = DirectoryLoader(
                str(directory),
                glob="**/*.md",
                loader_cls=UnstructuredMarkdownLoader,
                show_progress=True
            )
            
            documents = loader.load()
            
            # Add source type to metadata
            for doc in documents:
                doc.metadata['source_type'] = source_type
                doc.metadata['original_source'] = str(Path(doc.metadata['source']).relative_to(directory))
            
            print(f"✅ Loaded {len(documents)} documents from {source_type}")
            return documents
            
        except Exception as e:
            print(f"❌ Error loading documents from {directory}: {e}")
            return []
    
    def smart_chunk_documents(self, documents: List[Document], source_type: str) -> List[Document]:
        """Intelligently chunk documents based on their type and content"""
        print(f"🔄 Smart chunking {len(documents)} documents from {source_type}")
        
        all_chunks = []
        
        for doc in documents:
            try:
                # Choose splitter based on source type and content
                if source_type == "official_docs" and "```" in doc.page_content:
                    # Official docs with code - use markdown splitter first
                    chunks = self.chunk_with_markdown_structure(doc)
                elif source_type == "curated_content":
                    # Curated content - use recursive splitter
                    chunks = self.recursive_splitter.split_documents([doc])
                elif source_type == "examples":
                    # Code examples - use token splitter for precision
                    chunks = self.token_splitter.split_documents([doc])
                else:
                    # Default - recursive splitter
                    chunks = self.recursive_splitter.split_documents([doc])
                
                # Add chunk metadata
                for i, chunk in enumerate(chunks):
                    chunk.metadata.update({
                        'chunk_id': f"{source_type}_{len(all_chunks) + i}",
                        'chunk_index': i,
                        'total_chunks_in_doc': len(chunks),
                        'chunk_size': len(chunk.page_content),
                        'processing_method': self.get_processing_method(source_type, doc.page_content)
                    })
                
                all_chunks.extend(chunks)
                
            except Exception as e:
                print(f"⚠️  Error chunking document {doc.metadata.get('source', 'unknown')}: {e}")
                continue
        
        print(f"✅ Created {len(all_chunks)} chunks from {source_type}")
        return all_chunks
    
    def chunk_with_markdown_structure(self, doc: Document) -> List[Document]:
        """Use markdown structure-aware chunking"""
        try:
            # First split by headers to preserve structure
            header_splits = self.markdown_splitter.split_text(doc.page_content)
            
            # Convert to documents
            header_docs = []
            for split in header_splits:
                new_doc = Document(
                    page_content=split.page_content,
                    metadata={**doc.metadata, **split.metadata}
                )
                header_docs.append(new_doc)
            
            # Then apply recursive splitting if chunks are still too large
            final_chunks = []
            for header_doc in header_docs:
                if len(header_doc.page_content) > 1200:
                    sub_chunks = self.recursive_splitter.split_documents([header_doc])
                    final_chunks.extend(sub_chunks)
                else:
                    final_chunks.append(header_doc)
            
            return final_chunks
            
        except Exception as e:
            print(f"⚠️  Markdown splitting failed, falling back to recursive: {e}")
            return self.recursive_splitter.split_documents([doc])
    
    def get_processing_method(self, source_type: str, content: str) -> str:
        """Determine which processing method was used"""
        if source_type == "official_docs" and "```" in content:
            return "markdown_structure_aware"
        elif source_type == "examples":
            return "token_based"
        else:
            return "recursive_character"
    
    def enhance_chunk_metadata(self, chunks: List[Document]) -> List[Document]:
        """Add enhanced metadata to chunks for better retrieval"""
        print("🔍 Enhancing chunk metadata...")
        
        for chunk in chunks:
            content = chunk.page_content.lower()
            
            # Add topic tags
            topics = []
            if any(word in content for word in ['server', 'mcp server']):
                topics.append('server')
            if any(word in content for word in ['client', 'mcp client']):
                topics.append('client')
            if any(word in content for word in ['resource', 'resources']):
                topics.append('resources')
            if any(word in content for word in ['tool', 'tools']):
                topics.append('tools')
            if any(word in content for word in ['prompt', 'prompts']):
                topics.append('prompts')
            if any(word in content for word in ['transport', 'transports']):
                topics.append('transports')
            if any(word in content for word in ['example', 'code', '```']):
                topics.append('examples')
            if any(word in content for word in ['error', 'debug', 'troubleshoot']):
                topics.append('troubleshooting')
            
            chunk.metadata['topics'] = topics
            
            # Add content type
            if '```' in chunk.page_content:
                chunk.metadata['has_code'] = True
                chunk.metadata['content_type'] = 'code_example'
            elif any(word in content for word in ['how to', 'step', 'guide']):
                chunk.metadata['content_type'] = 'tutorial'
            elif '?' in chunk.page_content:
                chunk.metadata['content_type'] = 'faq'
            else:
                chunk.metadata['content_type'] = 'documentation'
            
            # Add complexity level
            if any(word in content for word in ['basic', 'introduction', 'what is']):
                chunk.metadata['complexity'] = 'beginner'
            elif any(word in content for word in ['advanced', 'implementation', 'architecture']):
                chunk.metadata['complexity'] = 'advanced'
            else:
                chunk.metadata['complexity'] = 'intermediate'
        
        print("✅ Enhanced metadata for all chunks")
        return chunks
    
    def save_processed_documents(self, chunks: List[Document], filename: str):
        """Save processed documents in LangChain-compatible format"""
        output_path = self.output_dir / filename
        
        # Convert to serializable format
        serializable_chunks = []
        for chunk in chunks:
            serializable_chunks.append({
                'page_content': chunk.page_content,
                'metadata': chunk.metadata
            })
        
        # Create comprehensive output
        output_data = {
            'documents': serializable_chunks,
            'metadata': {
                'total_chunks': len(chunks),
                'processing_date': datetime.now().isoformat(),
                'processing_method': 'langchain_text_splitters',
                'splitter_config': {
                    'recursive_chunk_size': 1000,
                    'recursive_overlap': 200,
                    'token_chunk_size': 800,
                    'token_overlap': 100
                }
            },
            'statistics': self.generate_statistics(chunks)
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(chunks)} processed documents to {output_path}")
    
    def generate_statistics(self, chunks: List[Document]) -> Dict[str, Any]:
        """Generate statistics about the processed chunks"""
        stats = {
            'total_chunks': len(chunks),
            'source_types': {},
            'topics': {},
            'content_types': {},
            'complexity_levels': {},
            'avg_chunk_size': 0,
            'chunks_with_code': 0
        }
        
        total_size = 0
        for chunk in chunks:
            # Source types
            source_type = chunk.metadata.get('source_type', 'unknown')
            stats['source_types'][source_type] = stats['source_types'].get(source_type, 0) + 1
            
            # Topics
            for topic in chunk.metadata.get('topics', []):
                stats['topics'][topic] = stats['topics'].get(topic, 0) + 1
            
            # Content types
            content_type = chunk.metadata.get('content_type', 'unknown')
            stats['content_types'][content_type] = stats['content_types'].get(content_type, 0) + 1
            
            # Complexity
            complexity = chunk.metadata.get('complexity', 'unknown')
            stats['complexity_levels'][complexity] = stats['complexity_levels'].get(complexity, 0) + 1
            
            # Size stats
            total_size += len(chunk.page_content)
            if chunk.metadata.get('has_code', False):
                stats['chunks_with_code'] += 1
        
        stats['avg_chunk_size'] = total_size // len(chunks) if chunks else 0
        
        return stats
    
    def process_all_data(self):
        """Main processing function using LangChain"""
        print("🚀 Starting LangChain Data Processing")
        print("=" * 50)
        
        all_chunks = []
        
        # Process each data source
        data_sources = [
            ("official-docs", "official_docs"),
            ("curated-content", "curated_content"),
            ("examples", "examples")
        ]

        # Also process individual markdown files in the data directory
        individual_files = list(self.data_dir.glob("*.md"))
        if individual_files:
            print(f"📄 Processing {len(individual_files)} individual markdown files...")
            for file_path in individual_files:
                try:
                    loader = TextLoader(str(file_path), encoding='utf-8')
                    documents = loader.load()

                    # Add metadata
                    for doc in documents:
                        doc.metadata['source_type'] = 'troubleshooting'
                        doc.metadata['original_source'] = file_path.name

                    # Smart chunking
                    chunks = self.smart_chunk_documents(documents, 'troubleshooting')
                    all_chunks.extend(chunks)
                    print(f"✅ Processed {file_path.name}: {len(chunks)} chunks")

                except Exception as e:
                    print(f"❌ Error processing {file_path.name}: {e}")
        
        for dir_name, source_type in data_sources:
            directory = self.data_dir / dir_name
            
            # Load documents
            documents = self.load_documents_from_directory(directory, source_type)
            
            if documents:
                # Smart chunking
                chunks = self.smart_chunk_documents(documents, source_type)
                all_chunks.extend(chunks)
        
        if not all_chunks:
            print("❌ No documents found to process!")
            return
        
        # Enhance metadata
        all_chunks = self.enhance_chunk_metadata(all_chunks)
        
        # Save processed data
        self.save_processed_documents(all_chunks, "langchain_documents.json")
        
        # Generate and save summary
        stats = self.generate_statistics(all_chunks)
        summary_path = self.output_dir / "processing_summary_langchain.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        print("=" * 50)
        print("✅ LangChain data processing completed!")
        print(f"📊 Statistics:")
        print(f"   Total chunks: {stats['total_chunks']}")
        print(f"   Source types: {stats['source_types']}")
        print(f"   Top topics: {dict(list(stats['topics'].items())[:5])}")
        print(f"   Average chunk size: {stats['avg_chunk_size']} characters")
        print(f"   Chunks with code: {stats['chunks_with_code']}")
        print(f"💾 Output files:")
        print(f"   - langchain_documents.json (ready for vector store)")
        print(f"   - processing_summary_langchain.json (statistics)")

if __name__ == "__main__":
    processor = LangChainDataProcessor()
    processor.process_all_data()
