
import React, { useState } from 'react';
import { Item, Store, Deal } from '../types';
import { findDeals } from '../services/geminiService';
import { Search, Loader2, DollarSign, ExternalLink, AlertCircle, Store as StoreIcon, ShoppingCart, MapPin, Globe } from 'lucide-react';

interface DealFinderProps {
  items: Item[];
  stores: Store[];
  userLocation: { lat: number, lng: number } | null;
}

export const DealFinder: React.FC<DealFinderProps> = ({ items, stores, userLocation }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10 miles

  // Only show items that need restocking (stock <= 50%)
  const candidateItems = items.filter(i => i.currentStock <= 50);

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const handleSearch = async () => {
    if (selectedItems.size === 0) return;
    
    setLoading(true);
    setHasSearched(true);
    setDeals([]); // Clear previous results
    
    const targetItems = items.filter(i => selectedItems.has(i.id));
    const foundDeals = await findDeals(targetItems, stores, userLocation, searchRadius);
    
    setDeals(foundDeals);
    setLoading(false);
  };

  const getStoreSearchUrl = (storeName: string, query: string) => {
     // Helpers to generate "Add to Cart" like behavior via search
     const q = encodeURIComponent(query);
     const lowerStore = storeName.toLowerCase();
     
     if (lowerStore.includes('amazon')) return `https://www.amazon.com/s?k=${q}`;
     if (lowerStore.includes('walmart')) return `https://www.walmart.com/search?q=${q}`;
     if (lowerStore.includes('target')) return `https://www.target.com/s?searchTerm=${q}`;
     if (lowerStore.includes('whole foods')) return `https://www.wholefoodsmarket.com/search?text=${q}`;
     if (lowerStore.includes('costco')) return `https://www.costco.com/CatalogSearch?keyword=${q}`;
     
     // Fallback to Google Shopping
     return `https://www.google.com/search?tbm=shop&q=${q}+at+${encodeURIComponent(storeName)}`;
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex-none mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Smart Deal Finder</h2>
        <p className="text-slate-500">Select items to find the best prices across your stores.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Selection Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:col-span-1">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Items to buy</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {candidateItems.length === 0 ? (
               <p className="p-4 text-sm text-slate-400">No low stock items to compare.</p>
            ) : candidateItems.map(item => (
              <div 
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                  selectedItems.has(item.id) 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-slate-400">{item.currentStock}% Stock</span>
              </div>
            ))}
          </div>
          
          {/* Controls */}
          <div className="p-4 border-t border-slate-100 space-y-3">
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                   <MapPin size={12} /> Max Distance (Proximity)
                </label>
                <select 
                   value={searchRadius} 
                   onChange={(e) => setSearchRadius(Number(e.target.value))}
                   className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none bg-slate-50"
                >
                   <option value={1}>1 Mile (Walking distance)</option>
                   <option value={5}>5 Miles (Local)</option>
                   <option value={10}>10 Miles (Short Drive)</option>
                   <option value={25}>25 Miles (Willing to drive)</option>
                </select>
             </div>

             <button
                onClick={handleSearch}
                disabled={selectedItems.size === 0 || loading}
                className="w-full bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
             >
               {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
               {loading ? 'Comparing...' : 'Find Best Deals'}
             </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-10">
          {loading && (
             <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
                <p>Gemini is searching prices within {searchRadius} miles...</p>
             </div>
          )}
          
          {!loading && !hasSearched && (
             <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p>Select items and click Find to see results.</p>
             </div>
          )}

          {!loading && hasSearched && deals.length === 0 && (
             <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                <AlertCircle className="mb-2 text-slate-400" size={32} />
                <p className="font-medium">No deals found.</p>
                <p className="text-sm mt-1">Try increasing your search radius or changing items.</p>
             </div>
          )}

          {deals.map((deal, idx) => {
             const isAvailable = deal.inStock && deal.price > 0;
             const matchedItem = items.find(i => i.id === deal.itemId);
             const itemName = matchedItem ? matchedItem.name : deal.itemId;
             const shopUrl = getStoreSearchUrl(deal.storeName, itemName);

             // Heuristic to guess if this deal result is from physical store or online
             const isLikelyPhysical = deal.description.toLowerCase().includes('in stock') || deal.description.toLowerCase().includes('aisle');

             return (
                <div key={idx} className={`bg-white p-5 rounded-xl shadow-sm border ${isAvailable ? 'border-slate-200' : 'border-slate-100 bg-slate-50'} flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in slide-in-from-bottom-4`} style={{animationDelay: `${idx * 100}ms`}}>
                  <div className={`p-3 rounded-full flex-shrink-0 ${isAvailable ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                    {isLikelyPhysical ? <StoreIcon size={24} /> : <Globe size={24} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className={`font-bold truncate ${isAvailable ? 'text-slate-800' : 'text-slate-500'}`}>{itemName}</h3>
                       <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{deal.storeName}</span>
                       {deal.isMemberPrice && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 font-medium">Member Price</span>}
                    </div>
                    
                    <p className={`text-sm ${isAvailable ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                       {deal.description || (isAvailable ? 'Available' : 'Not available')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                     {isAvailable ? (
                        <div className="text-right">
                           <span className="text-2xl font-bold text-slate-900">${deal.price.toFixed(2)}</span>
                           <span className="text-xs text-slate-400 block">{deal.currency}</span>
                        </div>
                     ) : (
                        <div className="px-3 py-1 bg-gray-200 rounded text-xs font-bold text-gray-500">
                           NOT SOLD / OOS
                        </div>
                     )}
                     
                     {isAvailable && (
                        <a 
                           href={shopUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                        >
                           <ShoppingCart size={14} /> Shop Now
                        </a>
                     )}
                  </div>
                </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};
