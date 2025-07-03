# AI-Powered Product Recommendation System

A full-stack web application with intelligent product recommendations using content-based filtering.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL 8.0
- **Authentication**: JWT with HTTP-only cookies
- **ML Libraries**: scikit-learn, pandas, numpy, nltk

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 3.3.3
- **State Management**: React Query + Zustand
- **Animations**: Framer Motion

## Project Structure

```
AI_product_recommendation/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database models and connection
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md              # Project documentation
```

## Features

- User authentication and registration
- Product catalog with search and filtering
- AI-powered product recommendations
- User interaction tracking (views, likes, purchases)
- Content-based filtering algorithm
- Responsive and modern UI with smooth animations

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0
- MySQL Workbench (optional)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Development

This project implements a content-based recommendation system that:
1. Analyzes product features (category, description, price)
2. Creates feature vectors using TF-IDF
3. Calculates product similarities using cosine similarity
4. Recommends products similar to user's liked items

## License

MIT License
