
import React, { useState } from 'react';
import { ScanBarcode, ShoppingCart, Tag, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface OnboardingProps {
  onFinish: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to KitchenSync",
      description: "The operating system for your kitchen. Let's sync your inventory, streamline your shopping, and stop food waste.",
      icon: <div className="text-6xl mb-4">🍳</div>,
      color: "bg-indigo-600"
    },
    {
      title: "Point-of-Use Scanning",
      description: "Don't write lists. Scan items as you throw them away ('Deplete') to add them to your list, or scan when you unpack ('Restock') to update inventory.",
      icon: <ScanBarcode size={64} className="text-white mb-6" />,
      color: "bg-blue-600"
    },
    {
      title: "Shopping Verification",
      description: "Never buy the wrong item again. In the store, use Verification Mode to scan a product and confirm it matches your list exactly.",
      icon: <CheckCircle2 size={64} className="text-white mb-6" />,
      color: "bg-green-600"
    },
    {
      title: "Proximity Deals",
      description: "Find the best prices at Amazon, Walmart, or your local bodega. We compare prices based on where you are right now.",
      icon: <Tag size={64} className="text-white mb-6" />,
      color: "bg-purple-600"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative">
        <button 
           onClick={onFinish}
           className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-1 rounded-full hover:bg-white/10"
        >
           <X size={24} />
        </button>

        {/* Hero Section */}
        <div className={`${steps[step].color} p-10 flex flex-col items-center justify-center text-center transition-colors duration-500`}>
           <div className="animate-in zoom-in duration-500 delay-100">
              {steps[step].icon}
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
        </div>

        {/* Content Section */}
        <div className="p-8 flex-1 flex flex-col justify-between bg-white dark:bg-slate-800">
           <p className="text-slate-600 dark:text-slate-300 text-center text-lg leading-relaxed mb-8">
              {steps[step].description}
           </p>

           <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-2">
                 {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 ' + steps[step].color.replace('bg-', 'bg-') : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                    ></div>
                 ))}
              </div>

              <button 
                 onClick={handleNext}
                 className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                 {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
