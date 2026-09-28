
import React from 'react';
import { Item } from '../types';
import { RefreshCcw, Edit2, ScanBarcode } from 'lucide-react';

interface InventoryProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  onScanRequest?: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, setItems, onScanRequest }) => {
  const updateStock = (id: string, newVal: number) => {
    setItems(items.map(i => i.id === id ? { ...i, currentStock: Math.max(0, Math.min(100, newVal)) } : i));
  };

  const getDaysRemaining = (item: Item) => {
     const days = Math.ceil((item.currentStock / 100) * item.consumptionRate);
     return days;
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-24 relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">My Fridge & Pantry</h2>
           <p className="text-slate-500">Track what you have. Scan to add or deplete.</p>
        </div>
        {onScanRequest && (
           <button 
              onClick={onScanRequest}
              className="bg-slate-800 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-900 transition-colors"
           >
              <ScanBarcode size={20} /> <span className="hidden sm:inline">Scan Items</span>
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         {items.map(item => {
            const daysLeft = getDaysRemaining(item);
            const isLow = daysLeft <= 3;
            return (
               <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <span className="text-xs text-slate-500">{item.category}</span>
                     </div>
                     <div className={`text-xs font-bold px-2 py-1 rounded-full ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {daysLeft} Days Left
                     </div>
                  </div>
                  
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs text-slate-600">
                        <span>Stock Level</span>
                        <span>{item.currentStock}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="10"
                        value={item.currentStock}
                        onChange={(e) => updateStock(item.id, parseInt(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isLow ? 'accent-red-500 bg-red-100' : 'accent-indigo-600 bg-indigo-100'}`}
                     />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-400">Last bought: {new Date(item.lastPurchased).toLocaleDateString()}</span>
                      <button className="text-indigo-600 hover:bg-indigo-50 p-1 rounded">
                         <Edit2 size={14} />
                      </button>
                  </div>
               </div>
            );
         })}
      </div>
      
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 items-start">
         <RefreshCcw className="text-indigo-600 mt-1" size={20} />
         <div>
            <h4 className="font-semibold text-indigo-900">Smart Decay Active</h4>
            <p className="text-indigo-800 text-sm">
               Stock levels automatically decrease daily based on your consumption rate.
            </p>
         </div>
      </div>
      
      {/* Floating Action Button for Mobile */}
      <button 
         onClick={onScanRequest}
         className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
         <ScanBarcode size={24} />
      </button>
    </div>
  );
};
