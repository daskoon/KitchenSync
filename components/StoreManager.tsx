
import React, { useState } from 'react';
import { Store } from '../types';
import { Plus, Trash2, Check, ExternalLink, MapPin, Globe, Store as StoreIcon, Navigation } from 'lucide-react';

interface StoreManagerProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  userLocation: { lat: number, lng: number } | null;
}

export const StoreManager: React.FC<StoreManagerProps> = ({ stores, setStores, userLocation }) => {
  const [newStore, setNewStore] = useState<Partial<Store>>({
    name: '',
    isOnline: true,
    isPhysical: false,
    hasMembership: false
  });

  const handleAddStore = () => {
    if (!newStore.name) return;
    const store: Store = {
      id: Date.now().toString(),
      name: newStore.name,
      url: newStore.url || '',
      isOnline: newStore.isOnline || false,
      isPhysical: newStore.isPhysical || false,
      hasMembership: newStore.hasMembership || false,
      membershipDetails: newStore.membershipDetails || '',
    };
    setStores([...stores, store]);
    setNewStore({ name: '', isOnline: true, isPhysical: false, hasMembership: false, url: '', membershipDetails: '' });
  };

  const removeStore = (id: string) => {
    setStores(stores.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">My Stores</h2>
        <p className="text-slate-500">Manage your preferred retailers. Use icons to designate online or physical availability.</p>
      </div>

      {/* Add New Store Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-4">Add Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Store Name</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Amazon, Trader Joe's, Local Bakery"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            />
          </div>
          
          <div className="md:col-span-2 flex gap-6 py-2">
             <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${newStore.isOnline ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-slate-200 text-slate-300'}`}>
                    <Globe size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">Online</span>
                    <input type="checkbox" className="hidden" checked={newStore.isOnline} onChange={e => setNewStore({...newStore, isOnline: e.target.checked})} />
                </div>
             </label>

             <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${newStore.isPhysical ? 'bg-green-50 border-green-500 text-green-600' : 'border-slate-200 text-slate-300'}`}>
                    <StoreIcon size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">Physical Store</span>
                    <input type="checkbox" className="hidden" checked={newStore.isPhysical} onChange={e => setNewStore({...newStore, isPhysical: e.target.checked})} />
                </div>
             </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Website URL (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://..."
              value={newStore.url || ''}
              onChange={(e) => setNewStore({ ...newStore, url: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-4 mt-2">
             <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${newStore.hasMembership ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                   <input type="checkbox" className="hidden" checked={newStore.hasMembership} onChange={e => setNewStore({...newStore, hasMembership: e.target.checked})} />
                   {newStore.hasMembership && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm text-slate-700">I have a membership</span>
             </label>
          </div>
           {newStore.hasMembership && (
            <div className="md:col-span-2">
               <label className="block text-xs font-medium text-slate-500 mb-1">Membership Details</label>
               <input
                 type="text"
                 className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="e.g. Prime Member, Gold Card"
                 value={newStore.membershipDetails || ''}
                 onChange={(e) => setNewStore({ ...newStore, membershipDetails: e.target.value })}
               />
            </div>
           )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddStore}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add Store
          </button>
        </div>
      </div>
      
      {/* Existing Stores List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group relative overflow-hidden">
            {/* Corner Icons */}
            <div className="absolute top-0 right-0 p-3 flex gap-1">
                {store.isOnline && (
                    <div className="text-blue-500 bg-blue-50 p-1 rounded-md" title="Online Store">
                        <Globe size={16} />
                    </div>
                )}
                {store.isPhysical && (
                    <div className="text-green-600 bg-green-50 p-1 rounded-md" title="Physical Location">
                        <StoreIcon size={16} />
                    </div>
                )}
            </div>

            <div>
              <div className="flex justify-between items-start mb-2 pr-16">
                <h4 className="font-bold text-lg text-slate-800">{store.name}</h4>
              </div>
              
              {store.url && (
                <a href={store.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 mb-2 truncate max-w-[200px]">
                  {store.url.replace(/^https?:\/\/(www\.)?/, '')} <ExternalLink size={10} />
                </a>
              )}
              
              {store.hasMembership && (
                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 mt-2 inline-block">
                  <span className="font-semibold">Member:</span> {store.membershipDetails}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
               {store.isPhysical && (
                  <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name)}`}
                     target="_blank"
                     rel="noreferrer"
                     className="text-xs bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  >
                     <Navigation size={14} /> Navigate
                  </a>
               )}
               {!store.isPhysical && <div></div>} {/* Spacer if no physical store */}

               <button
                 onClick={() => removeStore(store.id)}
                 className="text-slate-400 hover:text-red-500 transition-colors"
                 title="Remove Store"
               >
                 <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
