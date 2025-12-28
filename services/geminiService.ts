
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Product, PriceSuggestion } from '../types';

export async function* generateRecipeStream(productName: string) {
    // Create instance right before use to pick up the latest API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const stream = await ai.models.generateContentStream({
            model: "gemini-3-flash-preview",
            contents: `Provide a simple and delicious recipe using ${productName}. The recipe should be easy for a beginner cook. Format it with a title, a short description, ingredients list, and step-by-step instructions. Use markdown for formatting.`,
        });

        for await (const chunk of stream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating recipe:", error);
        yield "Sorry, I couldn't come up with a recipe right now. Please try again later.";
    }
}


export async function getPriceSuggestions(products: Product[]): Promise<PriceSuggestion[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a pricing expert for a digital farmer's market. Analyze the following product data. Suggest new prices to optimize sales. Generally, items with high stock (e.g., > 50) should have a slight discount, and items with low stock (e.g., < 20) could have a slight price increase. Provide a brief reason for each suggestion.

    Product Data:
    ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock })))}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        productId: { type: Type.STRING },
                        suggestedPrice: { type: Type.NUMBER },
                        reason: { type: Type.STRING },
                      },
                      required: ["productId", "suggestedPrice", "reason"],
                    },
                },
            },
        });

        const suggestions = JSON.parse(response.text);
        return suggestions;
    } catch (error) {
        console.error("Error getting price suggestions:", error);
        throw new Error("Failed to get AI price suggestions.");
    }
}

export async function generateProductImage(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const fullPrompt = `A professional, clean product photograph of ${prompt}, on a simple, light-colored background. The image should look realistic and appealing for an e-commerce site.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Switched to default model for better compatibility
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                    // imageSize is only for gemini-3-pro-image-preview
                },
            },
        });

        // The response may contain both image and text parts; iterate through all parts to find the image part.
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64EncodeString}`;
            }
        }
        
        throw new Error("AI did not return an image.");

    } catch (error: any) {
        console.error("Error generating product image:", error);
        // Handle specific permission error logic if needed
        throw error;
    }
}

export async function findFarmsNear(latitude: number, longitude: number): Promise<GenerateContentResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find farms near me that sell fresh produce directly to consumers. Provide a brief description of what they offer, including any specialities.",
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: latitude,
                            longitude: longitude
                        }
                    }
                }
            },
        });
        return response;
    } catch (error) {
        console.error("Error finding farms with Maps Grounding:", error);
        throw new Error("Failed to find farms using AI.");
    }
}
