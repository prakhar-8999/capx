# Portfolio Tracker

A full-stack application for tracking stock portfolios with real-time market data.

## Features

- 📈 Real-time stock price tracking
- 📊 Interactive dashboard with portfolio metrics
- ✨ Add, edit, and delete stock holdings
- 📱 Responsive design for all devices
- 🔄 Automatic portfolio value updates
- 📊 Portfolio distribution visualization

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Real-time data updates

### Backend
- FastAPI (Python)
- MySQL database
- Yahoo Finance API integration
- RESTful API architecture

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prakhar-8999/capx
cd capx
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
npm install
```

4. Set up environment variables:
```bash
# Backend (.env)
DATABASE_URL=mysql://user:password@localhost:3306/portfolio
API_KEY=your_yahoo_finance_api_key

# Frontend (.env)
VITE_API_URL=http://localhost:8000/api
```

5. Initialize the database:
```bash
python init_db.py
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Stocks
- `GET /api/stocks/` - Get all stocks
- `POST /api/stocks/` - Add a new stock
- `PUT /api/stocks/{id}` - Update a stock
- `DELETE /api/stocks/{id}` - Delete a stock

### Portfolio
- `GET /api/portfolio/metrics` - Get portfolio metrics

## Sample API Request

Adding a new stock:
```json
POST /api/stocks/
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "quantity": 10,
  "buyPrice": 175.50
}
```
