import { useState, useEffect } from 'react';
import { Airplay } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StockList } from './components/StockList';
import { AddEditStockModal } from './components/AddEditStockModal';
import type { Stock, PortfolioMetrics } from './types';
import { fetchStocks, fetchPortfolioMetrics, addStock, updateStock, deleteStock } from './services/api';
import Loader from './components/Loader';

function App() {
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [stocksData, metricsData] = await Promise.all([
        fetchStocks(),
        fetchPortfolioMetrics(),
      ]);
      setStocks(stocksData);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddStock = async (newStock: Partial<Stock>) => {
    setLoading(true)
    try {
      await addStock(newStock as Omit<Stock, 'id' | 'currentPrice'>);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to add stock');
      console.error('Error adding stock:', err);
    }
    setLoading(false)
  };

  const handleEditStock = async (updatedStock: Partial<Stock>) => {
    if (!selectedStock?.id) return;
    setLoading(true)
    try {
      await updateStock(selectedStock.id, updatedStock);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to update stock');
      console.error('Error updating stock:', err);
    }
    setLoading(false)
  };

  const handleDeleteStock = async (id: string) => {
    setLoading(true)
    try {
      await deleteStock(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete stock');
      console.error('Error deleting stock:', err);
    }
    setLoading(false)
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Airplay className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Portfolio Tracker</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSelectedStock(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {metrics && <Dashboard metrics={metrics} />}
        
        <StockList
          stocks={stocks}
          onEdit={(stock) => {
            setSelectedStock(stock);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteStock}
        />

        <AddEditStockModal
          stock={selectedStock}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStock(undefined);
          }}
          onSave={selectedStock ? handleEditStock : handleAddStock}
        />
      </main>
    </div>
  );
}

export default App;