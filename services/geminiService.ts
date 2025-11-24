import { GoogleGenerativeAI } from "@google/generative-ai";
import { MenuItem, AIRecommendation } from "../types";

// Access API key from environment variables
const API_KEY = process.env.API_KEY || ''; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const getUpsellRecommendation = async (
  currentItems: MenuItem[],
  allItems: MenuItem[]
): Promise<AIRecommendation | null> => {
  if (!API_KEY) {
    console.warn("API Key not found");
    return null;
  }

  if (currentItems.length === 0) return null;

  const cartNames = currentItems.map(i => i.name).join(", ");
  // Use the passed allItems to generate context dynamically
  const menuContext = allItems.map(i => `${i.name} (${i.category})`).join(", ");

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are an expert waiter at a boutique Israeli cafe.
    The current table has ordered: [${cartNames}].
    Based on the full menu below, suggest exactly 1 or 2 items to upsell (complementary drinks or desserts).
    Explain why in a short, persuasive sentence in Hebrew (max 15 words).
    
    Menu Context:
    ${menuContext}

    Return JSON only with the following structure:
    {
      "recommendedItemNames": ["Exact Name 1", "Exact Name 2"],
      "reasonInHebrew": "Short reason here"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const data = JSON.parse(jsonMatch[0]);
    
    // Map names back to IDs using dynamic menu items
    const recommendedIds: string[] = [];
    if (data.recommendedItemNames) {
      data.recommendedItemNames.forEach((name: string) => {
        const found = allItems.find(m => m.name.includes(name) || name.includes(m.name));
        if (found) recommendedIds.push(found.id);
      });
    }

    return {
      itemIds: recommendedIds,
      reason: data.reasonInHebrew
    };

  } catch (error) {
    console.error("Gemini recommendation failed:", error);
    return null;
  }
};

export const getWaitStaffChecklist = async (): Promise<string> => {
    if (!API_KEY) return "API Key missing";

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      I am opening a new cafe restaurant. Create a concise, professional checklist in Hebrew of the top 10 most critical technical and operational details I need to provide to a software developer to build the perfect waiter app. 
      Focus on menu structure, table layout, printer configurations, and staff permissions.
      Format as a clean HTML list (<ul><li>...</li></ul>).
    `;
    
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "";
    } catch (e) {
        return "שגיאה בקבלת הנתונים";
    }
}