# KitchenSync 🍳📲

**The Operating System for Your Kitchen.**

---

## 📱 Google Play Store Description

**App Name:** KitchenSync: Smart Grocery & Inventory

**Short Description:**
Synchronize your kitchen inventory, verify purchases to prevent errors, find local deals, and automate your shopping list with AI.

**Long Description:**
Welcome to KitchenSync, the all-in-one domestic logistics platform designed to solve the three biggest headaches of household management: running out of staples, buying the wrong items, and overpaying for groceries.

KitchenSync treats your kitchen like a professional warehouse, but with the simplicity of a single tap. It transforms your phone into a powerful scanner that manages the flow of goods in and out of your home.

**✨ Key Features:**

*   **📦 Point-of-Use Inventory:** Don't sit down to make a list. Scan items as you throw them away ("Deplete") to instantly add them to your list, or scan as you unpack groceries ("Restock") to track your inventory levels.
*   **✅ Verification Mode:** Never buy the wrong item again. In "Shopping Mode," scan the barcode of the product on the shelf. KitchenSync compares it to your list and instantly warns you if you picked up the wrong size, flavor, or brand.
*   **💰 Proximity Deal Finder:** Stop guessing where to shop. Select items on your list, set your driving radius (1-25 miles), and let our AI compare prices across your specific physical and online stores (Amazon, Walmart, Costco, Local Markets).
*   **📉 Smart Decay:** The app learns how fast you consume items (e.g., coffee every 14 days) and proactively warns you before you run out.
*   **🥗 Dietary Intelligence:** Tap "Nutrition" on any list item to see carb counts and instantly swap for a Keto-friendly alternative with one click.
*   **📍 Store Navigation:** One-tap navigation to local stores via Google Maps when you decide to head out.
*   **👩‍🍳 AI Chef:** Don't know what to cook? The Recipe tab suggests meals based *only* on the ingredients you currently have in stock.

**Stop managing your kitchen. Start Synchronizing.**

---

## 🛠️ Developer Instructions

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/kitchen-sync.git
    cd kitchen-sync
    ```

    *Note: The project structure assumes the root directory contains the `index.html` and source files directly.*

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Required dependencies:* `react`, `react-dom`, `lucide-react`, `recharts`, `@google/genai`, `tailwindcss`.

3.  **Environment Setup:**
    The application relies on the Google Gemini API for deal finding, image recognition, and recipe generation.
    
    Ensure your runtime environment (or bundler) injects the `process.env.API_KEY` variable.

4.  **Run the development server:**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Technology Stack
*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **AI Integration:** Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Visualization:** Recharts
*   **Icons:** Lucide React

### Permissions
This app requires the following browser permissions to function fully:
*   **Camera:** For scanning product barcodes/labels.
*   **Geolocation:** For finding physical store deals within a specific radius.
