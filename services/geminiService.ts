
import { GoogleGenAI, Type } from "@google/genai";
import { Item, Store, Deal, Recipe } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const findDeals = async (
  items: Item[],
  stores: Store[],
  userLocation: { lat: number, lng: number } | null,
  searchRadius: number = 10
): Promise<Deal[]> => {
  if (!items.length || !stores.length) return [];

  const model = "gemini-2.5-flash";
  
  // Construct a prompt that includes store context and capabilities
  const itemsToSearch = items.map(i => i.name).join(", ");
  const storeContext = stores.map(s => {
      const caps = [];
      if (s.isOnline) caps.push("Online");
      if (s.isPhysical) caps.push("Physical Store");
      return `${s.name} (${caps.join(" & ")}, Member: ${s.hasMembership ? 'Yes' : 'No'})`;
  }).join("; ");

  const locationContext = userLocation 
    ? `My location is Lat: ${userLocation.lat}, Lng: ${userLocation.lng}.` 
    : "I am looking for general pricing.";

  const prompt = `
    I need to find the current price and availability for these specific items: ${itemsToSearch}.
    Check these specific retailers: ${storeContext}.
    
    SEARCH CONTEXT:
    ${locationContext}
    For physical store availability, STRICTLY limit your search to locations within a ${searchRadius} mile radius of my coordinates.
    
    IMPORTANT RULES:
    1. Look for the EXACT items specified (Brand, Size, Count). Do not substitute with generic versions unless the specific one is unavailable, but note that.
    2. If a store does not sell the specific item, return a result with price 0, inStock false, and description "Not sold at this store".
    3. Consider my membership status for pricing.
    4. Perform a Google Search to find the most up-to-date information.

    After gathering the data, formatting the output as a valid JSON array of objects is critical.
    Do not use markdown code blocks (like \`\`\`json). Just return the raw JSON string.
    
    The JSON objects must follow this structure:
    {
      "itemId": "The name of the item from the request list",
      "storeName": "Name of the store",
      "price": Number (e.g. 12.99, or 0 if not sold),
      "currency": "USD",
      "url": "Link to product or store page",
      "description": "Details about the deal (e.g. 'In stock at Main St location' or 'Online Only')",
      "isMemberPrice": boolean,
      "inStock": boolean
    }
  `;

  try {
    const config: any = {
      tools: [{ googleSearch: {} }],
      // responseMimeType and responseSchema are NOT allowed when using googleSearch
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config
    });

    if (response.text) {
      let jsonStr = response.text.trim();
      // Sanitize response if model wraps it in markdown
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?|```$/g, '').trim();
      }

      const rawDeals = JSON.parse(jsonStr);
      return rawDeals.map((d: any) => {
        const matchedItem = items.find(i => i.name.toLowerCase().includes(d.itemId.toLowerCase()) || d.itemId.toLowerCase().includes(i.name.toLowerCase()));
        return {
          ...d,
          itemId: matchedItem ? matchedItem.id : 'unknown',
          url: d.url || '#'
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching deals:", error);
    return [];
  }
};

export const getConsumptionAnalysis = async (items: Item[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  const context = items.map(i => 
    `${i.name}: Stock ${i.currentStock}%, Bought ${i.lastPurchased}, Rate ${i.consumptionRate} days`
  ).join("\n");

  const prompt = `
    Analyze my shopping inventory:
    ${context}

    Tell me 3 short, specific things:
    1. What am I likely to run out of in the next 3 days?
    2. Are there any patterns (e.g. "You buy milk every 7 days but you have 50% left")?
    3. A suggestion to optimize my shopping.
    
    Keep it friendly and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not analyze inventory.";
  } catch (e) {
    return "AI is taking a nap. Try again later.";
  }
};

export const findNearbyStores = async (
  query: string, 
  location: { lat: number, lng: number }
) => {
  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 3 ${query} locations near me.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            retrievalConfig: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng
                }
            }
        }
      }
    });
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const identifyProductFromImage = async (base64Image: string): Promise<string | null> => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Identify this product. Return the exact Brand, Specific Product Name, Size/Weight, and Count if visible (e.g., 'Hefty Ultra Strong Trash Bags, 30 Gallon, 10 Count'). Be precise. Return JUST the product title." }
        ]
      }
    });
    return response.text ? response.text.trim() : null;
  } catch (e) {
    console.error("Image ID failed", e);
    return null;
  }
};

export const suggestRecipes = async (items: Item[]): Promise<Recipe[]> => {
  const model = "gemini-2.5-flash";
  // Only consider items with some stock
  const availableItems = items.filter(i => i.currentStock > 0).map(i => i.name).join(", ");
  
  const prompt = `
    Based on these available ingredients: ${availableItems}, suggest 3 recipes I can make.
    It is okay if I am missing 1 or 2 common ingredients (like spices, oil, etc), but prioritize using what I have.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.STRING },
              matchScore: { type: Type.NUMBER, description: "Percentage match 0-100 based on ingredients owned" }
            },
            required: ["name", "description", "instructions", "matchScore"]
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getNutritionInsights = async (itemName: string): Promise<{ carbs: string; ketoAlternative: string } | null> => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze the food item "${itemName}".
      Return a JSON object with:
      1. "carbs": Approximate carbs per serving (e.g. "27g per cup").
      2. "ketoAlternative": A lower carb substitute name (e.g. "Zucchini Noodles").
      If "${itemName}" is likely not a food item, return null.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                carbs: { type: Type.STRING },
                ketoAlternative: { type: Type.STRING },
                isFood: { type: Type.BOOLEAN }
            }
        }
      }
    });
    if (response.text) {
        const data = JSON.parse(response.text);
        if (!data.isFood) return null;
        return { carbs: data.carbs, ketoAlternative: data.ketoAlternative };
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};
