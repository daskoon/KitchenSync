
import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Settings as SettingsIcon } from 'lucide-react';
import { Item, Store, ViewState, UserSettings } from './types';
import { MOCK_ITEMS, MOCK_STORES, NAV_ITEMS, DEFAULT_SETTINGS } from './constants';
import { Dashboard } from './components/Dashboard';
import { ShoppingList } from './components/ShoppingList';
import { DealFinder } from './components/DealFinder';
import { StoreManager } from './components/StoreManager';
import { Inventory } from './components/Inventory';
import { RecipeIdeas } from './components/RecipeIdeas';
import { Scanner } from './components/Scanner';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState<Item | null>(null);

  // Settings State
  const [settings, setSettingsState] = useState<UserSettings>(() => {
     const saved = localStorage.getItem('kitchenSyncSettings');
     return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Persist Settings
  const setSettings = (newSettings: UserSettings) => {
     setSettingsState(newSettings);
     localStorage.setItem('kitchenSyncSettings', JSON.stringify(newSettings));
  };

  // Apply Theme & Font Size
  useEffect(() => {
     // Theme
     if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
     } else {
        document.documentElement.classList.remove('dark');
     }

     // Font Size (Standard Tailwind base is 1rem = 16px)
     // Large will be 18px (approx 1.125rem)
     if (settings.fontSize === 'large') {
        document.documentElement.style.fontSize = '18px';
     } else {
        document.documentElement.style.fontSize = '16px';
     }
  }, [settings.theme, settings.fontSize]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.log("Location access denied or error:", err)
      );
    }
  }, []);

  const handleScan = (productName: string, mode: 'IN' | 'OUT') => {
    // --- VERIFICATION LOGIC ---
    if (verifyingItem) {
      const target = verifyingItem.name.toLowerCase();
      const scanned = productName.toLowerCase();
      
      const isMatch = scanned.includes(target) || target.includes(scanned);

      if (isMatch) {
         alert(`Verified! You scanned: ${productName}. Marking as purchased.`);
         setItems(prev => prev.map(item => 
           item.id === verifyingItem.id 
             ? { ...item, currentStock: 100, lastPurchased: new Date().toISOString() } 
             : item
         ));
         setVerifyingItem(null);
         setIsGlobalScannerOpen(false);
      } else {
         const override = window.confirm(`Possible Mismatch!\n\nExpected: ${verifyingItem.name}\nScanned: ${productName}\n\nDo you want to mark it as correct anyway?`);
         if (override) {
            setItems(prev => prev.map(item => 
              item.id === verifyingItem.id 
                ? { ...item, currentStock: 100, lastPurchased: new Date().toISOString() } 
                : item
            ));
            setVerifyingItem(null);
            setIsGlobalScannerOpen(false);
         }
      }
      return;
    }

    // --- STANDARD INVENTORY LOGIC ---
    const existingItemIndex = items.findIndex(i => 
      i.name.toLowerCase().includes(productName.toLowerCase()) || 
      productName.toLowerCase().includes(i.name.toLowerCase())
    );

    if (existingItemIndex >= 0) {
       const updatedItems = [...items];
       if (mode === 'IN') {
          updatedItems[existingItemIndex] = {
             ...updatedItems[existingItemIndex],
             currentStock: 100,
             lastPurchased: new Date().toISOString()
          };
       } else {
          updatedItems[existingItemIndex] = {
             ...updatedItems[existingItemIndex],
             currentStock: 0
          };
       }
       setItems(updatedItems);
    } else {
       const newItem: Item = {
          id: Date.now().toString(),
          name: productName,
          category: 'Scanned',
          currentStock: mode === 'IN' ? 100 : 0,
          consumptionRate: 7,
          lastPurchased: new Date().toISOString(),
          autoRestock: mode === 'OUT',
          preferredStoreIds: []
       };
       setItems(prev => [...prev, newItem]);
    }
  };

  const handleVerifyRequest = (item: Item) => {
     setVerifyingItem(item);
     setIsGlobalScannerOpen(true);
  };

  const finishOnboarding = () => {
     setSettings({ ...settings, showOnboarding: false });
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.DASHBOARD:
        return <Dashboard items={items} stores={stores} />;
      case ViewState.LIST:
        return <ShoppingList items={items} setItems={setItems} onNavigate={setView} onScanRequest={() => setIsGlobalScannerOpen(true)} onVerifyRequest={handleVerifyRequest} />;
      case ViewState.DEALS:
        return <DealFinder items={items} stores={stores} userLocation={userLocation} />;
      case ViewState.STORES:
        return <StoreManager stores={stores} setStores={setStores} userLocation={userLocation} />;
      case ViewState.INVENTORY:
        return <Inventory items={items} setItems={setItems} onScanRequest={() => setIsGlobalScannerOpen(true)} />;
      case ViewState.RECIPES:
        return <RecipeIdeas items={items} />;
      case ViewState.SETTINGS:
        return <Settings settings={settings} setSettings={setSettings} onRestartOnboarding={() => setSettings({...settings, showOnboarding: true})} />;
      default:
        return <ShoppingList items={items} setItems={setItems} onNavigate={setView} onScanRequest={() => setIsGlobalScannerOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Onboarding Overlay */}
      {settings.showOnboarding && <Onboarding onFinish={finishOnboarding} />}

      {isGlobalScannerOpen && (
         <Scanner 
            onClose={() => {
               setIsGlobalScannerOpen(false);
               setVerifyingItem(null); 
            }}
            onScan={handleScan}
            verificationMode={!!verifyingItem}
            targetName={verifyingItem?.name}
         />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-10 shadow-lg transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <ShoppingBasket size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">KitchenSync</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
           <button
              onClick={() => setView(ViewState.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === ViewState.SETTINGS 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <SettingsIcon size={24} />
              Settings
            </button>
           
           <div className="bg-slate-900 dark:bg-black rounded-xl p-4 text-white shadow-lg mt-2">
              <p className="text-xs text-slate-400 mb-1">API Status</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                 <span className="text-sm font-medium">Gemini Active</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-800 z-20 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm transition-colors">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <ShoppingBasket size={18} />
              </div>
             <h1 className="text-lg font-bold text-slate-800 dark:text-white">KitchenSync</h1>
         </div>
         <button 
            onClick={() => setView(ViewState.SETTINGS)}
            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2"
         >
            <SettingsIcon size={24} />
         </button>
      </header>

      {/* Mobile Bottom Navigation (Tabbed) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 pb-safe transition-colors">
         <div className="flex justify-around items-center">
             {NAV_ITEMS.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => setView(item.id as ViewState)}
                    className={`flex flex-col items-center justify-center py-3 px-2 w-full transition-colors ${
                       view === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                 >
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                    <span className="text-[10px] font-medium mt-1">{item.label}</span>
                 </button>
             ))}
         </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen overflow-x-hidden pb-24 md:pb-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
