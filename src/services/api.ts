import type { Stock, PortfolioMetrics } from '../types';

const API_BASE_URL = 'https://capx.eveque.in/api';

export async function fetchStocks(): Promise<Stock[]> {
  const response = await fetch(`${API_BASE_URL}/stocks/`);
  if (!response.ok) {
    throw new Error('Failed to fetch stocks');
  }
  return response.json();
}

export async function fetchPortfolioMetrics(): Promise<PortfolioMetrics> {
  const response = await fetch(`${API_BASE_URL}/portfolio/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio metrics');
  }
  return response.json();
}

export async function addStock(stock: Omit<Stock, 'id' | 'currentPrice'>): Promise<Stock> {
  const response = await fetch(`${API_BASE_URL}/stocks/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stock),
  });
  if (!response.ok) {
    throw new Error('Failed to add stock');
  }
  return response.json();
}

export async function updateStock(id: string, stock: Partial<Stock>): Promise<Stock> {
  const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stock),
  });
  if (!response.ok) {
    throw new Error('Failed to update stock');
  }
  return response.json();
}

export async function deleteStock(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete stock');
  }
}