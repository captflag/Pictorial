import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { LessonPlan, ExperimentResult, PracticeQuestion, StudyNote, GradingResult, Reactant, VisualContent, ImageAnalysisResult } from '../types';

// NOTE: For Veo (Video Generation), we must instantiate a new client 
// with the key from window.aistudio.openSelectKey() at the time of the call.
// For standard calls, we use process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema definition for structured JSON output
const lessonPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    summary: { type: Type.STRING, description: "A comprehensive but concise summary of the topic." },
    difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
    visualPrompt: { type: Type.STRING, description: "A detailed prompt to generate an educational illustration about this topic. Describe the scene, objects, and style (e.g., 'A cross-section diagram of...')." },
    analogy: { type: Type.STRING, description: "A real-world analogy to help explain the concept simply." },
    keyConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          icon: { type: Type.STRING, description: "A generic name for an icon representing this concept (e.g., 'atom', 'book', 'globe')." }
        },
        required: ["title", "description", "icon"]
      }
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING, description: "General explanation of the correct answer." },
          optionExplanations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of brief explanations for each option index. Specifically explain why the distractor options are incorrect."
          }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation", "optionExplanations"]
      }
    }
  },
  required: ["topic", "summary", "difficulty", "visualPrompt", "analogy", "keyConcepts", "quiz"]
};

const experimentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    observation: { type: Type.STRING, description: "Detailed visual and auditory observations (e.g., color change, effervescence, precipitate formation)." },
    explanation: { type: Type.STRING, description: "The scientific principle and balanced chemical equation(s)." },
    stoichiometry: { type: Type.STRING, description: "Calculations showing limiting reagents, theoretical yield, and products formed based on input amounts." },
    safetyNote: { type: Type.STRING, description: "Important safety precautions for this specific mixture." },
    visualPrompt: { type: Type.STRING, description: "A highly detailed prompt to generate an image of the experiment's result." },
    equation: { type: Type.STRING, description: "The balanced chemical equation." },
    safetyLevel: { type: Type.INTEGER, description: "Safety level from 1 (Safe) to 10 (Dangerous)." }
  },
  required: ["observation", "explanation", "visualPrompt", "stoichiometry", "equation", "safetyLevel"]
};

const suggestionsSchema: Schema = {
  type: Type.ARRAY,
  items: { type: Type.STRING }
};

const practiceQuestionsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['MCQ', 'Short', 'Long', 'PYQ'] },
      question: { type: Type.STRING },
      answer: { type: Type.STRING, description: "Detailed answer or solution." },
      marks: { type: Type.INTEGER },
      year: { type: Type.STRING, description: "The exam year if it is a PYQ, otherwise empty." },
      isImportant: { type: Type.BOOLEAN },
      subject: { type: Type.STRING, description: "The subject of the question (e.g. Physics, Chemistry)" }
    },
    required: ["question", "answer", "type", "marks", "subject"]
  }
};

const studyNoteSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subject: { type: Type.STRING },
    targetClass: { type: Type.STRING },
    sourcesUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          content: { type: Type.STRING, description: "Detailed, textbook-quality content for this section." }
        },
        required: ["heading", "content"]
      }
    },
    importantFormulas: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "subject", "targetClass", "sourcesUsed", "sections", "importantFormulas"]
};

const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "The score awarded out of the max marks." },
    maxMarks: { type: Type.NUMBER },
    feedback: { type: Type.STRING, description: "Constructive feedback on what was good and what was missing." },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific bullet points on how to improve the answer next time." }
  },
  required: ["score", "maxMarks", "feedback", "improvements"]
};

const chaptersSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    chapters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of official chapter titles." }
  },
  required: ["chapters"]
};

const visualDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    notes: { 
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Time or section reference" },
          content: { type: Type.STRING, description: "Description of visual element" }
        }
      }
    }
  }
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallAnalysis: { type: Type.STRING, description: "Brief overall educational summary of the image." },
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Name of the specific part." },
          description: { type: Type.STRING, description: "Explanation of this part." },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Bounding box [ymin, xmin, ymax, xmax] coordinates normalized to 0-1."
          }
        },
        required: ["label", "description", "box_2d"]
      }
    }
  },
  required: ["overallAnalysis", "elements"]
};

export const generateLessonPlan = async (topic: string): Promise<LessonPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a comprehensive visual learning lesson plan for the topic: "${topic}". 
      Focus on making it engaging for a student. 
      If the topic includes 'Class' or 'CBSE', strictly follow the NCERT curriculum standards for that level.
      Ensure the 'visualPrompt' is descriptive enough for an AI image generator to create a helpful diagram or illustration.
      Provide 4-5 key concepts and a 3-question quiz.
      For the quiz, ensure you provide specific explanations for why each option is correct or incorrect in the 'optionExplanations' field.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonPlanSchema,
        systemInstruction: "You are an expert educational content creator specializing in visual learning and the Indian CBSE/NCERT curriculum.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as LessonPlan;
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw error;
  }
};

export const generateEducationalImage = async (
  prompt: string,
  style: string = '3D Render',
  aspectRatio: string = '16:9'
): Promise<string | null> => {
  try {
    // Using gemini-2.5-flash-image for generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create an educational illustration for: "${prompt}". Style: ${style}. \n\nRequirements:\n- Clear and accurate representation\n- No text or labels in the image\n- High resolution details` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const editEducationalImage = async (
  base64Image: string,
  editPrompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for generated images
              data: base64Image.split(',')[1] // Remove header
            }
          },
          { text: editPrompt }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

export const upscaleImage = async (base64Image: string): Promise<string | null> => {
  // Upscaling uses Gemini 3 Pro which requires a selected API key
  if (typeof window !== 'undefined' && (window as any).aistudio) {
     const hasKey = await (window as any).aistudio.hasSelectedApiKey();
     if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
     }
  }

  // Create a fresh client instance to ensure the latest key is used
  const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1]
            }
          },
          { text: "Upscale this image to 4K resolution, enhancing details and sharpness while maintaining the original composition." }
        ]
      },
      config: {
        imageConfig: {
          imageSize: "4K"
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw error;
  }
};

export const analyzeImage = async (base64Image: string): Promise<ImageAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1]
            }
          },
          { text: "Analyze this educational image. Identify 3-5 key visual elements/parts. For each, provide a label, a short explanation, and the 2D bounding box [ymin, xmin, ymax, xmax]." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ImageAnalysisResult;
  } catch (e) {
    console.error("Analysis failed", e);
    return null;
  }
};

export const generateComprehensiveVisuals = async (
  topic: string,
  basePrompt: string
): Promise<VisualContent> => {
  // 1. Generate Video Prompt & Image Prompts
  const promptResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `For the topic "${topic}", create:
    1. A prompt for a 3D Diagram image.
    2. A prompt for a Real-World Application image.
    3. A prompt for a short educational video.
    4. 3 key bullet points explaining the visuals.
    
    Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt1: { type: Type.STRING },
          imagePrompt2: { type: Type.STRING },
          videoPrompt: { type: Type.STRING },
          notes: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const prompts = JSON.parse(promptResponse.text || "{}");

  // 2. Parallel Generation
  const [img1, img2, vidUrl] = await Promise.all([
    generateEducationalImage(prompts.imagePrompt1 || basePrompt, '3D Render'),
    generateEducationalImage(prompts.imagePrompt2 || basePrompt, 'Photorealistic'),
    generateVideo(prompts.videoPrompt || `Educational video about ${topic}`).catch(() => null)
  ]);

  return {
    images: [img1, img2].filter(Boolean) as string[],
    videoUrl: vidUrl,
    notes: prompts.notes || []
  };
};

export const simulateExperiment = async (
  labType: 'Chemistry' | 'Physics', 
  inputData: string | Reactant[], 
  conditions?: { temperature: number; pressure: number; catalyst: number }
): Promise<ExperimentResult> => {
  try {
    let conditionContext = "";
    if (conditions) {
      conditionContext = `
      Experimental Conditions:
      - Temperature: ${conditions.temperature}°C
      - Pressure: ${conditions.pressure} atm
      - Catalyst Concentration: ${conditions.catalyst}%
      `;
    }

    let prompt = "";
    if (labType === 'Chemistry' && Array.isArray(inputData)) {
      // Precise Chemistry Playground Logic
      const ingredients = inputData.map(r => `${r.amount}${r.unit} of ${r.name} (${r.formula})`).join(", ");
      prompt = `
      Perform a precise stoichiometric simulation for mixing the following chemicals:
      ${ingredients}

      ${conditionContext}

      Tasks:
      1. Identify the reaction(s) that occur.
      2. Calculate the Limiting Reagent based on the amounts provided.
      3. Determine the Theoretical Yield of products (Mass/Volume).
      4. Describe the physical changes (Color, Gas evolution, Precipitate, Heat).
      5. Provide a safety warning if dangerous gases or explosions occur.
      6. Provide the balanced chemical equation.
      7. Rate safety from 1-10.
      `;
    } else {
      // Physics or Legacy text input
      prompt = `Simulate a ${labType} experiment based on this input: "${inputData}".
      ${conditionContext}
      Describe the outcome scientifically but clearly for a student.
      Include a safety note if relevant (or 'Safe to perform virtually').
      Provide a visual prompt to generate an image of the result.
      Include a relevant physics equation if applicable.
      Rate safety 1-10.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: experimentSchema,
        systemInstruction: "You are an advanced Computational Chemistry and Physics Engine. You analyze reactions with stoichiometric precision, calculate yields, and predict physical phenomena accurately.",
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text) as ExperimentResult;
  } catch (error) {
    console.error("Error simulating experiment:", error);
    throw error;
  }
};

export const getExperimentSuggestions = async (topic: string, labType: 'Chemistry' | 'Physics'): Promise<string[]> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 simple, educational virtual ${labType} experiments related to the topic "${topic}". 
      If the topic is not directly related to ${labType}, suggest general fun educational experiments or analogies related to the topic.
      Keep descriptions concise (under 10 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionsSchema,
      },
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error getting suggestions", error);
    return [];
  }
};

export const generatePracticeQuestions = async (
  cls: string,
  subject: string,
  topic: string,
  isPYQ: boolean
): Promise<PracticeQuestion[]> => {
  try {
    let prompt = `Generate 5 practice questions for Class ${cls} ${subject}, topic: "${topic}". Include the subject name '${subject}' in the output.`;
    
    if (isPYQ) {
      prompt += `
      CRITICAL INSTRUCTIONS FOR PYQs:
      1. These MUST be authentic PREVIOUS YEAR BOARD EXAM QUESTIONS from CBSE papers (Years 2015-2024).
      2. Provide a balanced mix:
         - 1 MCQ (1 mark) -> Set 'type' to 'MCQ'
         - 2 Short Answer (2-3 marks) -> Set 'type' to 'Short'
         - 2 Long Answer (5 marks) -> Set 'type' to 'Long'
      3. STRICTLY populate the 'year' field with the source (e.g., "CBSE 2023", "Delhi Set 2 2019", "Compt 2020").
      4. Set 'isImportant' to true.
      5. Provide the 'answer' as a detailed marking scheme solution.
      `;
    } else {
      prompt += `
      Instructions:
      1. Create a balanced mix of conceptual questions:
         - 2 MCQs (1 mark) -> Set 'type' to 'MCQ'
         - 2 Short Answer (3 marks) -> Set 'type' to 'Short'
         - 1 Long Answer (5 marks) -> Set 'type' to 'Long'
      2. Set 'year' to an empty string.
      3. Set 'isImportant' based on concept frequency.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: practiceQuestionsSchema,
        systemInstruction: "You are an expert CBSE Board Examination Paper Setter. You provide accurate, curriculum-aligned questions with precise marking scheme solutions.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as PracticeQuestion[];
  } catch (error) {
    console.error("Error generating practice questions:", error);
    throw error;
  }
}

export const gradeStudentAnswer = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  maxMarks: number
): Promise<GradingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Grade this student answer based on the question and correct marking scheme.
      
      Question: "${question}"
      Student Answer: "${userAnswer}"
      Correct Answer / Marking Scheme: "${correctAnswer}"
      Max Marks: ${maxMarks}

      Strictly evaluate keyword presence, conceptual clarity, and completeness.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
        systemInstruction: "You are a strict but fair CBSE examiner. You grade answers based on keywords and conceptual accuracy.",
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No grading text returned");
    return JSON.parse(text) as GradingResult;
  } catch (error) {
    console.error("Error grading answer:", error);
    throw error;
  }
}

export const generateStudyNotes = async (
  cls: string,
  subject: string,
  topic: string
): Promise<StudyNote> => {
  // Determine Top 3 Books based on subject (Indian Context)
  let books = ["NCERT"];
  const sub = subject.toLowerCase();
  
  if (sub.includes("math")) {
    books = ["RD Sharma", "NCERT", "RS Aggarwal"];
  } else if (sub.includes("physic")) {
    books = ["HC Verma", "NCERT", "SL Arora"];
  } else if (sub.includes("chem")) {
    books = ["Pradeep's Chemistry", "NCERT", "Modern ABC"];
  } else if (sub.includes("bio")) {
    books = ["Trueman's Biology", "NCERT", "Pradeep's Biology"];
  } else if (sub.includes("english")) {
    books = ["Wren & Martin", "NCERT", "Together With English"];
  } else if (sub.includes("computer")) {
    books = ["Sumita Arora", "NCERT", "Preeti Arora"];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create comprehensive study notes for Class ${cls} ${subject}, topic: "${topic}".
      
      CRITICAL SOURCE INTEGRATION:
      You MUST derive information and solve examples based on the methodology of these top 3 books: ${books.join(", ")}.
      
      Structure:
      1. Synthesis of concepts from all 3 books (e.g. "As explained in RD Sharma...").
      2. Detailed theorems/definitions.
      3. Key Formulas.
      4. Step-by-step examples.
      
      Format the output as a structured JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyNoteSchema,
        systemInstruction: "You are a senior academic content editor. You create high-quality, print-ready study notes that synthesize the best parts of standard reference textbooks.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    return JSON.parse(text) as StudyNote;
  } catch (error) {
    console.error("Error generating study notes:", error);
    throw error;
  }
};

export const getCourseChapters = async (cls: string, subject: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List all the official chapters/units for CBSE Class ${cls} ${subject} based on the latest NCERT curriculum. Return only the list of chapter titles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: chaptersSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return (JSON.parse(text) as { chapters: string[] }).chapters;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

// --- CHAT & VIDEO SERVICES ---

export const generateChatResponse = async (
  message: string, 
  history: {role: 'user' | 'model', content: string}[],
  options: {
    mode: 'fast' | 'smart' | 'reasoning' | 'search',
    videoData?: string // base64
  }
) => {
  try {
    let model = 'gemini-2.5-flash-lite';
    let config: any = {};

    if (options.mode === 'smart') {
      model = 'gemini-3-pro-preview';
    } else if (options.mode === 'reasoning') {
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (options.mode === 'search') {
      model = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (options.videoData) {
      // Must use pro for video understanding
      model = 'gemini-3-pro-preview';
    }

    const parts: any[] = [];
    if (options.videoData) {
      parts.push({
        inlineData: {
          mimeType: 'video/mp4', // Assuming mp4 for generic upload
          data: options.videoData
        }
      });
    }
    parts.push({ text: message });
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: config
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const researchTopic = async (topic: string): Promise<{content: string, sources: {title: string, url: string}[]}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Research the following topic in detail: "${topic}".
      Provide a comprehensive summary including key facts, dates, and figures.
      Structure the response with clear headings (Markdown).`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a research agent. Your goal is to provide accurate, up-to-date information citing credible sources found via Google Search."
      }
    });

    // Extract sources from grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => ({
        title: chunk.web?.title,
        url: chunk.web?.uri
      }))
      .filter((s: any) => s.url && s.title);

    // Simple deduplication
    const uniqueSources = Array.from(new Map(sources.map((s:any) => [s.url, s])).values());

    return {
      content: response.text || "No results found.",
      sources: uniqueSources as {title: string, url: string}[]
    };
  } catch (error) {
    console.error("Research failed", error);
    throw error;
  }
};

export const generateVideo = async (
  prompt: string, 
  imageInput?: string // base64
): Promise<string> => {
  // Check for API key selection for Veo
  if (typeof window !== 'undefined' && (window as any).aistudio) {
     const hasKey = await (window as any).aistudio.hasSelectedApiKey();
     if (!hasKey) {
       throw new Error("API Key Selection Required");
     }
  }

  // Create fresh instance with environment key (which is injected after selection)
  const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation;
    if (imageInput) {
       // Animate image
       operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: imageInput.split(',')[1],
          mimeType: 'image/png' // Assuming png input
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    } else {
      // Text to video
      operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    }

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await videoAi.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    // Fetch the actual bytes
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("TTS Error", error);
    return null;
  }
};
