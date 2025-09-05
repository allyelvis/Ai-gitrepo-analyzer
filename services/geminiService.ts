import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SuggestionItem, UpdatePlanSection } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
      },
      required: ["title", "summary", "strengths"],
    },
    suggestions: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              suggestion: { type: Type.STRING },
            },
            required: ["category", "suggestion"],
          },
        },
      },
      required: ["title", "items"],
    },
    buildPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.INTEGER },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["step", "title", "description"],
          },
        },
      },
      required: ["title", "steps"],
    },
  },
  required: ["analysis", "suggestions", "buildPlan"],
};

export const analyzeRepo = async (repoUrl: string): Promise<AnalysisResult> => {
  const prompt = `
    You are a world-class senior software architect and tech lead with deep expertise in full-stack development, UI/UX design, and scalable cloud infrastructure. Your task is to perform a conceptual analysis of a GitHub repository based on its name and URL. You do not have direct access to the code.

    Repository URL: ${repoUrl}

    Based on the repository name and common practices for a project of this nature (e.g., if it's an IDE, a game, a data tool), provide a comprehensive analysis.

    Generate a response in a structured JSON format according to the provided schema. The analysis should be insightful, actionable, and professional.

    1.  **Project Analysis**: Provide a high-level overview of the project's likely purpose, potential tech stack, and key architectural considerations. Identify at least 3 potential strengths based on industry best practices for such an application.
    2.  **Improvement Suggestions**: Offer at least 3 concrete suggestions for improvement across different categories like 'UI/UX', 'Performance', 'Architecture', 'Security', or 'New Features'. The suggestions must be detailed and well-reasoned.
    3.  **Implementation Roadmap**: Create a high-level, step-by-step build plan or roadmap for implementing the suggested improvements or building the project from a solid foundation. Outline at least 3 logical steps.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonString = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};

const implementationPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          relatedSuggestionCategory: { type: Type.STRING },
        },
        required: ["id", "title", "description", "relatedSuggestionCategory"],
      },
    },
  },
  required: ["title", "tasks"],
};

export const generateImplementationPlan = async (repoUrl: string, suggestions: SuggestionItem[]): Promise<UpdatePlanSection> => {
  const suggestionsText = suggestions.map(s => `- ${s.category}: ${s.suggestion}`).join('\n');

  const prompt = `
    You are an expert software developer assigned to implement a series of improvements for a project.

    Repository URL: ${repoUrl}
    This URL provides context for the type of project you are working on.

    Improvement Suggestions:
    ${suggestionsText}

    Your task is to create a detailed, actionable implementation plan based on these suggestions. Break down the work into a logical sequence of tasks. Each task should have a clear title and a description of the work to be done. The plan should be structured as a JSON object following the provided schema.

    - The 'title' of the plan should be something like "Implementation Plan for [Repo Name]".
    - Create a list of 'tasks'.
    - For each task, provide an 'id', 'title', 'description', and the 'relatedSuggestionCategory' from the original list.
    - The descriptions should be practical and give a developer a clear starting point. For example, instead of "Improve UI", say "Refactor the main dashboard component using React hooks for state management and apply a consistent design system for all buttons and inputs."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: implementationPlanSchema,
        temperature: 0.5,
      },
    });

    const jsonString = response.text.trim();
    const result: UpdatePlanSection = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API for implementation plan:", error);
    throw new Error("Failed to generate implementation plan from AI service.");
  }
};