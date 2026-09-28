import React, { useEffect, useState } from 'react';
import { Item, Recipe } from '../types';
import { suggestRecipes } from '../services/geminiService';
import { Loader2, ChefHat, AlertCircle, ArrowRight } from 'lucide-react';

interface RecipeIdeasProps {
  items: Item[];
}

export const RecipeIdeas: React.FC<RecipeIdeasProps> = ({ items }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      // Get recipes based on items that have > 0 stock
      const result = await suggestRecipes(items);
      setRecipes(result);
      setLoading(false);
    };
    fetchRecipes();
  }, [items]); // Re-run if items change (e.g. after shopping)

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-20 text-slate-400 animate-in fade-in">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
        <p>Chef Gemini is checking your fridge...</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-24">
       <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
           <ChefHat className="text-indigo-600" /> 
           What can I make?
        </h2>
        <p className="text-slate-500">Recipes based on what you currently have in stock.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-bold text-slate-800">{recipe.name}</h3>
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      recipe.matchScore > 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                      {recipe.matchScore}% Match
                   </span>
                </div>
                <p className="text-slate-600 text-sm mb-4">{recipe.description}</p>
                
                <div className="mb-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ingredients Used</h4>
                   <div className="flex flex-wrap gap-2">
                      {recipe.ingredientsUsed.map((ing, i) => (
                         <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                            {ing}
                         </span>
                      ))}
                   </div>
                </div>

                {recipe.missingIngredients.length > 0 && (
                   <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                         <AlertCircle size={12} /> Missing
                      </h4>
                      <p className="text-sm text-orange-700">
                         {recipe.missingIngredients.join(", ")}
                      </p>
                   </div>
                )}
             </div>
             
             <div className="p-4 bg-slate-50 border-t border-slate-100">
                <details className="group">
                   <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-700">
                      <span>View Instructions</span>
                      <span className="transition group-open:rotate-180">
                         <ArrowRight size={16} className="rotate-90" />
                      </span>
                   </summary>
                   <div className="text-slate-600 text-sm mt-3 whitespace-pre-line pl-2 border-l-2 border-indigo-200">
                      {recipe.instructions}
                   </div>
                </details>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
