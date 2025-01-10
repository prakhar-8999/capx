from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
from mysql.connector import Error
import requests
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": "localhost",
    "user": "",
    "password": "",
    "database": "portfolio_tracker"
}

class StockBase(BaseModel):
    symbol: str
    name: str
    quantity: int = 1
    buy_price: float

class StockCreate(BaseModel):
    symbol: str
    name: str
    quantity: int
    buy_price: float 

    class Config:
        allow_population_by_field_name = True
        fields = {
            "buy_price": "buyPrice",
        }

class Stock(StockBase):
    id: int
    current_price: float
    created_at: datetime

    class Config:
        orm_mode = True

class Distribution(BaseModel):
    symbol: str
    percentage: float

class PortfolioMetrics(BaseModel):
    total_value: float
    top_performer: Optional[Stock]  # Allow None
    total_gain_loss: float
    distribution: List[Distribution]

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

async def get_stock_price(symbol: str) -> float:
    API_KEY = ""
    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={API_KEY}"
    response = requests.get(url)
    data = response.json()
    print(data)
    current_price = float(data["c"]) 
    
    return current_price

@app.post("/api/stocks/", response_model=Stock)
async def create_stock(stock: StockCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        current_price = await get_stock_price(stock.symbol)

        print(current_price)
        
        query = """
        INSERT INTO stocks (symbol, name, quantity, buy_price, current_price, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        created_at = datetime.utcnow()
        values = (stock.symbol, stock.name, stock.quantity, stock.buy_price, current_price, created_at)
        
        cursor.execute(query, values)
        conn.commit()
        new_stock_id = cursor.lastrowid
        return {**stock.dict(), "id": new_stock_id, "current_price": current_price, "created_at": created_at}
    
    finally:
        cursor.close()
        conn.close()

@app.get("/api/stocks/", response_model=List[Stock])
async def get_stocks():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM stocks")
        stocks = cursor.fetchall()
        
        for stock in stocks:
            stock["current_price"] = await get_stock_price(stock["symbol"])
        
        return stocks
    
    finally:
        cursor.close()
        conn.close()

@app.put("/api/stocks/{stock_id}", response_model=Stock)
async def update_stock(stock_id: int, stock: StockBase):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM stocks WHERE id = %s", (stock_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Stock not found")
        
        query = """
        UPDATE stocks
        SET symbol = %s, name = %s, quantity = %s, buy_price = %s, created_at = %s
        WHERE id = %s
        """
        created_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')  
        values = (stock.symbol, stock.name, stock.quantity, stock.buy_price, created_at, stock_id)
        
        cursor.execute(query, values)
        conn.commit()
        
        current_price = await get_stock_price(stock.symbol)
        return {**stock.dict(), "id": stock_id, "current_price": current_price, "created_at": created_at}
    
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/stocks/{stock_id}")
async def delete_stock(stock_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM stocks WHERE id = %s", (stock_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Stock not found")
        
        cursor.execute("DELETE FROM stocks WHERE id = %s", (stock_id,))
        conn.commit()
        
        return {"message": "Stock deleted successfully"}
    
    finally:
        cursor.close()
        conn.close()


@app.get("/api/portfolio/metrics", response_model=PortfolioMetrics)
async def get_portfolio_metrics():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM stocks")
        stocks = cursor.fetchall()
        
        if not stocks:
            return {
                "total_value": 0,
                "top_performer": None,
                "total_gain_loss": 0,
                "distribution": []
            }
        
        total_value = 0
        gains_losses = []
        for stock in stocks:
            current_price = await get_stock_price(stock["symbol"])
            stock["current_price"] = current_price
            stock_value = stock["quantity"] * current_price
            total_value += stock_value
            gain_loss = ((float(current_price) - float(stock["buy_price"])) / float(stock["buy_price"])) * 100
            gains_losses.append((stock, gain_loss))
        
        top_performer = max(gains_losses, key=lambda x: x[1])[0]
        total_gain_loss = sum(gl for _, gl in gains_losses) / len(gains_losses)
        distribution = [
            {
                "symbol": stock["symbol"],
                "percentage": (stock["quantity"] * stock["current_price"] / total_value) * 100
            }
            for stock in stocks
        ]
        
        return {
            "total_value": round(total_value, 2),
            "top_performer": top_performer,
            "total_gain_loss": round(total_gain_loss, 2),
            "distribution": distribution
        }
    finally:
        cursor.close()
        conn.close()

# SQL for creating the database schema:
"""
CREATE TABLE stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    buy_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symbol ON stocks(symbol);
"""
