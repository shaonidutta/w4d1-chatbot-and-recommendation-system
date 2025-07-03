#!/usr/bin/env python3
"""
Setup script to prepare MCP knowledge base data.
Run this script to set up your data folder structure and scrape official docs.
"""

import os
import subprocess
import sys
from pathlib import Path

def create_directory_structure():
    """Create the required directory structure"""
    directories = [
        "data/official-docs",
        "data/curated-content", 
        "data/examples",
        "processed_data",
        "scripts"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def install_requirements():
    """Install required packages for scraping"""
    print("Installing requirements for web scraping...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-scraper.txt"])
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def run_scraper():
    """Run the documentation scraper"""
    print("Scraping official MCP documentation...")
    try:
        subprocess.check_call([sys.executable, "scripts/scrape_mcp_docs.py"])
        print("✓ Documentation scraped successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error scraping documentation: {e}")
        return False
    return True

def process_data():
    """Process all markdown files into chunks using LangChain"""
    print("Processing markdown files with LangChain text splitters...")
    try:
        subprocess.check_call([sys.executable, "scripts/prepare_data_langchain.py"])
        print("✓ Data processed successfully with LangChain")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error processing data: {e}")
        return False
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up MCP Knowledge Base Data")
    print("=" * 50)
    
    # Step 1: Create directories
    print("\n1. Creating directory structure...")
    create_directory_structure()
    
    # Step 2: Install requirements
    print("\n2. Installing requirements...")
    if not install_requirements():
        print("❌ Setup failed at requirements installation")
        return
    
    # Step 3: Scrape documentation
    print("\n3. Scraping official documentation...")
    if not run_scraper():
        print("⚠️  Documentation scraping failed, but continuing with existing content...")
    
    # Step 4: Process data
    print("\n4. Processing data into chunks...")
    if not process_data():
        print("❌ Setup failed at data processing")
        return
    
    print("\n" + "=" * 50)
    print("✅ Setup completed successfully!")
    print("\nNext steps:")
    print("1. Review the processed data in 'processed_data/langchain_documents.json'")
    print("2. Add more curated content to 'data/curated-content/'")
    print("3. Add code examples to 'data/examples/'")
    print("4. Run 'python scripts/setup_langchain_pinecone.py' to setup vector database")
    print("\nData structure:")
    print("📁 data/")
    print("  ├── 📁 official-docs/     (scraped documentation)")
    print("  ├── 📁 curated-content/   (your custom content)")
    print("  └── 📁 examples/          (code examples)")
    print("📁 processed_data/")
    print("  ├── 📄 langchain_documents.json (LangChain processed)")
    print("  └── 📄 processing_summary_langchain.json (statistics)")

if __name__ == "__main__":
    main()
