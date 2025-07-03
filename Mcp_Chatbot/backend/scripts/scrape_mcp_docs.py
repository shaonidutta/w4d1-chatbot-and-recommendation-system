#!/usr/bin/env python3
"""
Script to scrape official MCP documentation and save as markdown files.
This will create a comprehensive knowledge base from the official docs.
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin, urlparse
import html2text
import json

class MCPDocScraper:
    def __init__(self, base_url="https://modelcontextprotocol.io", output_dir="data/official-docs"):
        self.base_url = base_url
        self.output_dir = output_dir
        self.visited_urls = set()
        self.h = html2text.HTML2Text()
        self.h.ignore_links = False
        self.h.ignore_images = True
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
    
    def get_page_content(self, url):
        """Fetch and parse a single page"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def extract_main_content(self, html_content):
        """Extract main content from HTML"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Try to find main content area (adjust selectors based on site structure)
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        
        if main_content:
            return str(main_content)
        return html_content
    
    def html_to_markdown(self, html_content):
        """Convert HTML to markdown"""
        return self.h.handle(html_content)
    
    def save_page(self, url, content, title=""):
        """Save page content as markdown file"""
        # Create filename from URL
        parsed = urlparse(url)
        path_parts = [p for p in parsed.path.split('/') if p]
        
        if not path_parts:
            filename = "index.md"
        else:
            filename = f"{'_'.join(path_parts)}.md"
        
        filepath = os.path.join(self.output_dir, filename)
        
        # Add metadata header
        markdown_content = f"""---
title: {title}
source_url: {url}
scraped_at: {time.strftime('%Y-%m-%d %H:%M:%S')}
---

{content}
"""
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"Saved: {filepath}")
    
    def get_all_links(self, html_content, base_url):
        """Extract all internal links from HTML"""
        soup = BeautifulSoup(html_content, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            # Only include internal links
            if urlparse(full_url).netloc == urlparse(base_url).netloc:
                links.append(full_url)
        
        return links
    
    def scrape_documentation(self):
        """Main scraping function"""
        # Key pages to scrape (add more as needed)
        key_pages = [
            "/introduction",
            "/quickstart/server",
            "/quickstart/client", 
            "/quickstart/user",
            "/specification/2025-06-18",
            "/specification/2025-06-18/architecture",
            "/docs/concepts/architecture",
            "/docs/concepts/resources",
            "/docs/concepts/prompts",
            "/docs/concepts/tools",
            "/docs/concepts/sampling",
            "/docs/concepts/transports",
            "/faqs",
            "/examples"
        ]
        
        for page_path in key_pages:
            url = urljoin(self.base_url, page_path)
            
            if url in self.visited_urls:
                continue
                
            print(f"Scraping: {url}")
            html_content = self.get_page_content(url)
            
            if html_content:
                main_content = self.extract_main_content(html_content)
                markdown_content = self.html_to_markdown(main_content)
                
                # Extract title
                soup = BeautifulSoup(html_content, 'html.parser')
                title = soup.find('title')
                title_text = title.text if title else page_path
                
                self.save_page(url, markdown_content, title_text)
                self.visited_urls.add(url)
                
                # Be respectful - add delay
                time.sleep(1)

if __name__ == "__main__":
    scraper = MCPDocScraper()
    scraper.scrape_documentation()
    print("Documentation scraping completed!")
