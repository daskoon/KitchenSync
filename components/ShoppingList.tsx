
import React, { useState } from 'react';
import { Item, ViewState } from '../types';
import { CheckCircle2, Circle, Plus, AlertTriangle, ScanBarcode, ArrowRight, Trash2, Leaf, Loader2, ArrowLeftRight, ShoppingCart, X, Check } from 'lucide-react';
import { getNutritionInsights } from '../services/geminiService';

interface ShoppingListProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  onNavigate: (view: ViewState) => void;
  onScanRequest?: () => void;
  onVerifyRequest?: (item: Item) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, setItems, onNavigate, onScanRequest, onVerifyRequest }) => {
  const [newItemName, setNewItemName] = useState('');
  const [loadingNutri, setLoadingNutri] = useState<string | null>(null);
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  // Items are "on list" if stock <= 50% OR explicitly added (we can simulate explicit add by stock=0 for new items)
  const shoppingList = items.filter(i => i.currentStock <= 50);

  // Separate completed/purchased items for current session (stock 100 but recently purchased) could be done, 
  // but simpler to just remove them from view in shopping mode when bought.
  
  const handleRestock = (id: string) => {
    // "Buy" the item: Set stock to 100%, update last purchased
    const now = new Date().toISOString();
    setItems(items.map(item => 
      item.id === id ? { ...item, currentStock: 100, lastPurchased: now } : item
    ));
  };

  const addNewItem = (name: string) => {
    if (!name) return;
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      category: 'Uncategorized',
      currentStock: 0, // Added to list immediately
      consumptionRate: 7, // Default
      lastPurchased: new Date().toISOString(),
      autoRestock: false,
      preferredStoreIds: []
    };
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const fetchNutrition = async (item: Item) => {
    if (item.nutrition) return; // Already fetched
    setLoadingNutri(item.id);
    const info = await getNutritionInsights(item.name);
    setLoadingNutri(null);
    
    if (info) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, nutrition: info } : i));
    }
  };

  const swapItem = (item: Item) => {
    if (!item.nutrition?.ketoAlternative) return;
    setItems(prev => prev.map(i => 
      i.id === item.id ? { 
        ...i, 
        name: item.nutrition!.ketoAlternative, 
        nutrition: undefined // Reset nutrition as item changed
      } : i
    ));
  };

  // --- SHOPPING MODE (FOCUS VIEW) ---
  if (isShoppingMode) {
    const totalItems = shoppingList.length + items.filter(i => i.currentStock === 100 && new Date(i.lastPurchased).getTime() > Date.now() - 3600000).length; // Hacky way to count items bought this session
    const boughtItems = items.filter(i => i.currentStock === 100 && new Date(i.lastPurchased).getTime() > Date.now() - 3600000).length;
    const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col pb-safe">
         <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div>
               <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Shopping Mode</h2>
               <div className="text-indigo-100 text-sm mt-1">
                  {shoppingList.length} items remaining
               </div>
            </div>
            <button 
               onClick={() => setIsShoppingMode(false)}
               className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
               <X />
            </button>
         </div>
         
         {/* Progress Bar */}
         <div className="h-2 bg-slate-100 w-full">
            <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {shoppingList.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                     <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">You're Done!</h3>
                  <p className="text-slate-500 mb-8">All items have been purchased.</p>
                  <button 
                     onClick={() => setIsShoppingMode(false)}
                     className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
                  >
                     Finish Trip
                  </button>
               </div>
            ) : (
               shoppingList.map(item => (
                  <div key={item.id} className="w-full flex gap-2">
                     <button
                        onClick={() => handleRestock(item.id)}
                        className="flex-1 text-left p-5 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:border-green-400 hover:bg-green-50 transition-all group flex items-center justify-between"
                     >
                        <div>
                           <span className="text-lg font-bold text-slate-800">{item.name}</span>
                           <p className="text-xs text-slate-500">{item.category}</p>
                        </div>
                        <span className="w-8 h-8 rounded-full border-2 border-slate-300 group-hover:border-green-500 flex items-center justify-center">
                           <Check className="opacity-0 group-hover:opacity-100 text-green-600" size={16} />
                        </span>
                     </button>
                     
                     {/* Verify Button */}
                     {onVerifyRequest && (
                        <button 
                           onClick={() => onVerifyRequest(item)}
                           className="w-16 bg-slate-100 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                           title="Scan to Verify"
                        >
                           <ScanBarcode size={24} />
                           <span className="text-[10px] font-bold mt-1">Verify</span>
                        </button>
                     )}
                  </div>
               ))
            )}
         </div>
         
         <div className="p-4 border-t border-slate-100 bg-slate-50">
            <p className="text-center text-xs text-slate-400">Tap items to mark done, or Scan to verify correctness.</p>
         </div>
      </div>
    );
  }

  // --- STANDARD LIST VIEW ---
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shopping List</h2>
          <p className="text-slate-500">
            {shoppingList.length} items need restocking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
           <button 
             onClick={() => setIsShoppingMode(true)}
             className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm font-medium"
           >
             <ShoppingCart size={18} /> Start Shopping
           </button>
           <button 
            onClick={() => onNavigate(ViewState.DEALS)}
            className="flex-1 md:flex-none bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors text-sm font-medium"
           >
             Compare Prices <ArrowRight size={16} />
           </button>
           {onScanRequest && (
             <button 
               onClick={onScanRequest}
               className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
             >
               <ScanBarcode size={18} /> <span className="hidden sm:inline">Scan</span>
             </button>
           )}
        </div>
      </div>

      {/* Quick Add Input */}
      <div className="mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="Add item manually (e.g. 'Milk')" 
          className="flex-1 p-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNewItem(newItemName)}
        />
        <button 
          onClick={() => addNewItem(newItemName)}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        {shoppingList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-700">All Stocked Up!</h3>
            <p className="text-sm">Your inventory is healthy. Add items manually or check the fridge.</p>
          </div>
        ) : (
          shoppingList.map(item => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group relative flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => handleRestock(item.id)}
                    className="text-slate-300 hover:text-green-600 transition-all transform hover:scale-110"
                    title="Mark as Purchased"
                  >
                    <Circle size={28} strokeWidth={1.5} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 text-lg truncate">{item.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{item.category}</span>
                      {item.currentStock < 20 && (
                        <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      )}
                      <button 
                         onClick={() => fetchNutrition(item)}
                         disabled={loadingNutri === item.id}
                         className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                      >
                         {loadingNutri === item.id ? <Loader2 size={10} className="animate-spin" /> : <Leaf size={10} />}
                         Nutrition
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <p className="text-xs text-slate-400">Used in:</p>
                     <p className="text-sm font-medium text-slate-600">{item.consumptionRate} days</p>
                   </div>
                   <button 
                     onClick={() => deleteItem(item.id)}
                     className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
              
              {/* Nutrition Info Panel */}
              {item.nutrition && (
                <div className="ml-11 mt-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex items-center justify-between text-sm animate-in slide-in-from-top-2">
                   <div className="flex gap-4">
                      <span className="text-emerald-800">
                         <strong>Carbs:</strong> {item.nutrition.carbs}
                      </span>
                      <span className="text-emerald-800">
                         <strong>Keto Option:</strong> {item.nutrition.ketoAlternative}
                      </span>
                   </div>
                   <button 
                      onClick={() => swapItem(item)}
                      className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors"
                      title={`Swap ${item.name} for ${item.nutrition.ketoAlternative}`}
                   >
                      <ArrowLeftRight size={12} /> Swap
                   </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
