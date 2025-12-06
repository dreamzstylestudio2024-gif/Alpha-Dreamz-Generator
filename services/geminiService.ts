
import { GoogleGenAI, Type } from "@google/genai";
import { DirectorState, StoryboardPanel, AspectRatio, StudioState, LuxuryState } from "../types";

const apiKey = process.env.API_KEY || '';
// Initial instance - note: for Veo we might need a fresh instance after key selection
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const rewriteVlogTopic = async (topic: string): Promise<string> => {
  if (!apiKey) return "API Key Missing";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following vlog topic into a catchy, viral, and engaging title/concept for a video platform. Keep it concise. Topic: "${topic}"`,
    });
    return response.text || topic;
  } catch (error) {
    console.error("Rewrite error:", error);
    return topic;
  }
};

export const generateDirectorImage = async (state: DirectorState): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing in environment variables.");

  const parts: any[] = [];

  // Add text prompt constructed from state
  let prompt = `Create a high-quality, photorealistic image for a ${state.creationMode} video.
    Aspect Ratio: ${state.aspectRatio}.
    Style: ${state.aesthetic}.
    Lighting: ${state.setLighting}.
    Camera Movement/Angle: ${state.cameraMovement} style still.
    
    ${state.characterPrompt ? `Specific Character Instruction: ${state.characterPrompt}` : ''}

    Subject Details:
    - Hair: ${state.hairStyle}
    - Makeup: ${state.makeup}
    - Skin: ${state.skinType}
    - Nails: ${state.nailStyle}
    
    Action: ${state.performanceAction}.
    Vibe: ${state.vibeGenre}, ${state.musicVideoFlow}.
    Context/Topic: ${state.vlogTopic}.
    Category: ${state.vlogCategory}.
  `;

  if (state.exactFace) {
    prompt += " Maintain exact facial consistency with provided reference if available.";
  }

  // Add reference images if they exist
  if (state.characterRef) {
    prompt += " [Use the following image as the Character Reference]";
    parts.push(await fileToPart(state.characterRef));
  }
  
  // Prioritize Wardrobe Reference for exact matching
  if (state.wardrobeRef) {
    prompt += " [WARDROBE REFERENCE IMAGE ATTACHED]";
    prompt += " CRITICAL INSTRUCTION: The generated character MUST wear the EXACT outfit depicted in the Wardrobe Reference image. Do not hallucinate a different outfit. 1. Match the material/texture (e.g., leather, cotton, shiny). 2. Reproduce any LOGOS, graphics, or text on the clothing exactly. 3. Match the specific cut, sleeve length, and neckline. 4. Match the exact color shade. The wardrobe reference takes precedence over any other style descriptions.";
    parts.push(await fileToPart(state.wardrobeRef));
  } else {
    // Only use text description if no visual reference is provided
    prompt += `\n    - Outfit Style: ${state.outfitStyle}`;
  }

  if (state.environmentRef) {
    prompt += " [Use the following image as the Environment/Background Reference]";
    parts.push(await fileToPart(state.environmentRef));
  }

  // Add the text prompt part
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
         imageConfig: {
           aspectRatio: state.aspectRatio === AspectRatio.Ratio_9_16 ? "9:16" : 
                        state.aspectRatio === AspectRatio.Ratio_16_9 ? "16:9" : "1:1"
         }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};

// Helper to generate a single image from a prompt
const generateSceneImage = async (imagePrompt: string, state: DirectorState): Promise<string> => {
    const parts: any[] = [];
    
    let fullPrompt = `Cinematic shot: ${imagePrompt}. Style: ${state.aesthetic}. Lighting: ${state.setLighting}.`;
    
    // Add outfit to scene generation as well
    if (state.wardrobeRef) {
         fullPrompt += " [WARDROBE REFERENCE] Subject MUST wear the EXACT clothing from the reference image. Match texture, logos, cut, and color exactly.";
         parts.push(await fileToPart(state.wardrobeRef));
    } else {
         fullPrompt += ` Outfit: ${state.outfitStyle}.`;
    }
    
    if (state.characterRef) {
        fullPrompt += " [Maintain consistent character appearance from reference]";
        parts.push(await fileToPart(state.characterRef));
    }
    
    parts.push({ text: fullPrompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: {
                    aspectRatio: "16:9" // Storyboards often 16:9, or use state.aspectRatio
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return ""; // Fallback
    } catch (e) {
        console.error("Failed to generate scene image", e);
        return "";
    }
}

export const generateFullStoryboard = async (state: DirectorState): Promise<StoryboardPanel[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  // 1. Generate the Script/Structure (JSON)
  const systemInstruction = `You are a professional film director and screenwriter. 
  Create a 10-panel storyboard sequence (10 distinct scenes) for a "${state.vlogCategory}" video titled "${state.vlogTopic}".
  Style: ${state.aesthetic}. Action: ${state.performanceAction}.
  Return JSON only.`;

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate the 10 storyboard details.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              panelId: { type: Type.INTEGER },
              scriptVoiceover: { type: Type.STRING, description: "The dialogue or voiceover script for this scene." },
              actionDetail: { type: Type.STRING, description: "Detailed description of character action and movement." },
              imagePrompt: { type: Type.STRING, description: "A detailed AI image generation prompt for this scene." },
              videoPrompt: { type: Type.STRING, description: "A prompt suitable for an AI video generator (e.g., Veo)." }
            },
            required: ["panelId", "scriptVoiceover", "actionDetail", "imagePrompt", "videoPrompt"]
          }
        }
      }
    });

    const panelsData = JSON.parse(textResponse.text || "[]") as Omit<StoryboardPanel, 'imageUrl'>[];

    if (!panelsData.length) throw new Error("Failed to generate storyboard data.");

    // 2. Generate Images for each panel SEQUENTIALLY to avoid Rate Limit (429) errors
    const fullPanels: StoryboardPanel[] = [];
    
    for (const panel of panelsData) {
        // Add a delay between requests to respect API rate limits (2 seconds)
        if (fullPanels.length > 0) {
             await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const imageUrl = await generateSceneImage(panel.imagePrompt, state);
        fullPanels.push({ ...panel, imageUrl } as StoryboardPanel);
    }

    return fullPanels;

  } catch (error) {
    console.error("Storyboard generation error:", error);
    throw error;
  }
};

/* STUDIO MODE SERVICES */

export const enhancePrompt = async (currentPrompt: string): Promise<string> => {
  if (!apiKey) return "API Key Missing";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve and expand this image generation prompt to be more detailed, artistic, and effective for high-quality AI image generation. Keep it under 50 words. Prompt: "${currentPrompt}"`,
    });
    return response.text || currentPrompt;
  } catch (error) {
    console.error("Enhance prompt error:", error);
    return currentPrompt;
  }
};

export const getRandomUGCPrompt = async (): Promise<string> => {
  if (!apiKey) return "API Key Missing";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a random, creative, and trending UGC (User Generated Content) style image prompt for a social media influencer lifestyle shot.`,
    });
    return response.text || "A trendy lifestyle shot";
  } catch (error) {
    console.error("Random prompt error:", error);
    return "A trendy lifestyle shot";
  }
};

export const generateStudioImage = async (state: StudioState): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const images: string[] = [];
  
  // Note: Gemini 2.5 Flash Image currently supports generating 1 image per request in standard usage via generateContent.
  // We will loop for batch count.

  for (let i = 0; i < state.batchCount; i++) {
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit protection

      const parts: any[] = [];
      
      let prompt = `Professional Studio Photography. 
      Subject Type: ${state.subjectType}.
      Composition: ${state.composition}.
      Description: ${state.prompt}.
      `;
      
      if (state.faceMatch && state.subjectType === 'Person') prompt += " Maintain exact facial features of the reference.";
      if (state.toneMatch && state.subjectType === 'Person') prompt += " Maintain exact skin tone of the reference.";
      if (state.bodyMatch && state.subjectType === 'Person') prompt += " Maintain exact body type, build, and proportions of the reference.";
      
      if (state.subjectImage) {
        parts.push(await fileToPart(state.subjectImage));
      }
      if (state.styleReference) {
        prompt += " Use the following image as a Style Reference.";
        parts.push(await fileToPart(state.styleReference));
      }

      parts.push({ text: prompt });

      // Map expanded aspect ratios to supported ones or default to 1:1 if unsupported by API directly
      let apiRatio = "1:1";
      if (state.aspectRatio === AspectRatio.Ratio_16_9) apiRatio = "16:9";
      if (state.aspectRatio === AspectRatio.Ratio_9_16) apiRatio = "9:16";
      if (state.aspectRatio === AspectRatio.Ratio_3_4) apiRatio = "3:4";
      if (state.aspectRatio === AspectRatio.Ratio_4_5) apiRatio = "3:4"; // Closest approx

      try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: {
                    aspectRatio: apiRatio as any 
                }
            }
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
          }
      } catch (e) {
          console.error(`Batch ${i+1} failed`, e);
      }
  }
  
  if (images.length === 0) throw new Error("Failed to generate images.");
  return images;
};

export const generateLogo = async (state: StudioState): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `Create a professional, vector-style flat logo design.
    Brand Name: ${state.logoBrand}
    Tagline: ${state.logoTagline}
    Industry: ${state.logoIndustry}
    Style: ${state.logoStyle}
    Background: Solid neutral color or transparent implication.
    Quality: High resolution, clean lines, minimalist or detailed based on style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No logo generated.");
  } catch (error) {
    console.error("Logo generation error:", error);
    throw error;
  }
};

/* LUXURY MODE SERVICES */
export const generateLuxuryImage = async (state: LuxuryState): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `High-End Luxury Editorial Photography.
    Theme: ${state.visualTheme}.
    Location: ${state.location}.
    Brand Vibes: ${state.brandInspiration}.
    
    Model Details:
    ${state.customPrompt ? `- Specific Character Instruction: ${state.customPrompt}` : ''}
    - Wardrobe: ${state.wardrobe}
    - Footwear: ${state.footwear}
    - Hair: ${state.hairstyle}, ${state.hairTexture}, ${state.hairLength}
    - Lips: ${state.lipDetail}
    - Nails: ${state.nails}
    - Pose: ${state.pose}
    
    Scene Assets:
    - Vehicle: ${state.luxuryVehicle}
    - Props: ${state.propsObjects}
    
    Quality: 8k resolution, vogue magazine style, cinematic lighting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No luxury image generated.");
  } catch (error) {
    console.error("Luxury generation error:", error);
    throw error;
  }
};

/* VIDEO GENERATION SERVICE (VEO) */
export const generateVeoVideo = async (prompt: string, imageBase64: string | undefined): Promise<string> => {
  // 1. Check for API Key selection (Mandatory for Veo)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
       await (window as any).aistudio.openSelectKey();
    }
  }

  // 2. Create a new instance to ensure key is fresh
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // 3. Construct input
  // Veo supports image input. If we have a base64 image, use it.
  const inputImage = imageBase64 ? {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png' // Assuming PNG from previous steps or convert
  } : undefined;

  try {
    // Start Generation
    let operation;
    
    if (inputImage) {
        operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: inputImage,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9' // VEO typically supports landscape well
            }
        });
    } else {
        operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    }

    // Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await veoAi.operations.getVideosOperation({ operation: operation });
    }

    // Get Result
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation completed but no URI returned.");

    // Fetch the actual bytes with the key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo video generation error:", error);
    throw error;
  }
};
