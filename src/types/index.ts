export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buy_price: number;
  current_price: number;
}

export interface PortfolioMetrics {
  total_value: number;
  top_performer: Stock | null;
  total_gain_loss: number;
  distribution: {
    symbol: string;
    percentage: number;
  }[];
}