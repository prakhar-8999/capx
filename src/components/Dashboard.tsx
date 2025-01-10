import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import type { PortfolioMetrics } from '../types';

interface DashboardProps {
  metrics: PortfolioMetrics;
}

export function Dashboard({ metrics }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${metrics.total_value}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Performer</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.top_performer?.symbol}
              </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
            <p className={`text-2xl font-bold ${metrics.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.total_gain_loss >= 0 ? '+' : ''}{metrics.total_gain_loss}%
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Holdings</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.distribution.length}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <PieChart className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}