
import React, { useEffect, useState } from 'react';
import { Item, Store } from '../types';
import { getConsumptionAnalysis } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingDown, Sparkles } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  stores: Store[];
}

export const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const lowStockItems = items.filter(i => i.currentStock < 30);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const result = await getConsumptionAnalysis(items);
      setAnalysis(result);
      setLoading(false);
    };
    // Debounce or only run on mount/major change to save API calls
    if (items.length > 0) {
        fetchAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = items.map(item => ({
    name: item.name,
    stock: item.currentStock,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-slate-500">Here is your inventory snapshot.</p>
      </header>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 flex-shrink-0 text-yellow-300" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">KitchenSync</h3>
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                 <p className="whitespace-pre-line">{analysis}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock Level Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Stock Levels</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stock < 30 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Running Low
          </h3>
          {lowStockItems.length === 0 ? (
            <p className="text-slate-500 text-sm">Everything looks stocked up!</p>
          ) : (
            <ul className="space-y-3">
              {lowStockItems.map(item => (
                <li key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                    <TrendingDown size={16} />
                    {item.currentStock}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
