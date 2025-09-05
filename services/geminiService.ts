import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UpdatePlanSection, RepoData } from '../types';

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the JSON schema for the expected response from the Gemini API.
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        conceptualAnalysis: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A concise title for the code analysis." },
                description: { type: Type.STRING, description: "A detailed overview of the project's purpose, architecture, and key components based on the provided code." },
            },
            required: ['title', 'description']
        },
        improvementSuggestions: {
            type: Type.ARRAY,
            description: "A list of actionable suggestions for improvement based on the provided code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "The category of the suggestions (e.g., 'Code Quality', 'Performance', 'Security')." },
                    suggestions: {
                        type: Type.ARRAY,
                        description: "A list of specific suggestions within this category, referencing file paths where applicable.",
                        items: { type: Type.STRING }
                    }
                },
                required: ['category', 'suggestions']
            }
        },
        updatePlan: {
            type: Type.OBJECT,
            description: "A step-by-step roadmap for implementing the suggested improvements.",
            properties: {
                title: { type: Type.STRING, description: "A title for the update plan, e.g., 'Proposed Implementation Roadmap'." },
                tasks: {
                    type: Type.ARRAY,
                    description: "A list of tasks to implement the plan.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique identifier for the task, e.g., 'task-1'." },
                            title: { type: Type.STRING, description: "A clear, concise title for the task." },
                            description: { type: Type.STRING, description: "A detailed description of what the task involves." },
                            relatedSuggestionCategory: { type: Type.STRING, description: "The category of the improvement suggestion this task addresses." }
                        },
                        required: ['id', 'title', 'description', 'relatedSuggestionCategory']
                    }
                }
            },
            required: ['title', 'tasks']
        }
    },
    required: ['conceptualAnalysis', 'improvementSuggestions', 'updatePlan']
};

export const analyzeRepository = async (repoUrl: string, repoData: RepoData): Promise<AnalysisResult> => {
    const fileTreeString = repoData.tree.map(file => `  - ${file.path} (${file.size} bytes)`).join('\n');

    const fileContentsString = repoData.files.map(file => `
---
File: ${file.path}
---
\`\`\`
${file.content.substring(0, 5000)}
\`\`\`
`).join('\n');


    const prompt = `
      You are an expert software engineer performing a code review and analysis.
      Analyze the GitHub repository located at: ${repoUrl}.

      I have fetched the repository's file structure and the content of key files for you.
      
      **Repository File Structure:**
      \`\`\`
      ${fileTreeString}
      \`\`\`

      **Content of Key Files:**
      ${fileContentsString}

      Based on this actual code and structure, provide the following analysis in JSON format. Do not browse the web. Your analysis must be based *only* on the information provided.

      1.  **Conceptual Analysis**: An overview of the project's purpose and architecture based on the code.
      2.  **Improvement Suggestions**: Actionable suggestions for improvement (Code Quality, Performance, Security, etc.), referencing specific files or code patterns.
      3.  **Update Plan**: A step-by-step roadmap for implementing these improvements. Each task should be clearly defined and linked to a suggestion category. Ensure task IDs are unique short strings (e.g., "task-1", "task-2").

      Please adhere strictly to the provided JSON schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema
            },
        });

        const jsonText = response.text.trim();
        const result: AnalysisResult = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error analyzing repository:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI analysis.");
    }
};

export const generateCommitMessage = async (updatePlan: UpdatePlanSection): Promise<string> => {
    const formattedTasks = updatePlan.tasks.map(task => `- ${task.title}: ${task.description} (Category: ${task.relatedSuggestionCategory})`).join('\n');

    const prompt = `
        Based on the following list of tasks from an implementation plan, create a single, well-formatted conventional commit message.
        The commit message should start with a type (e.g., 'feat', 'fix', 'refactor', 'chore') and a concise summary.
        The body of the commit message should elaborate on the key changes and improvements made, summarizing the tasks.
        Do not include any explanation, markdown formatting, or anything else; provide only the raw commit message text.

        Here are the tasks:
        ${formattedTasks}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating commit message:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get commit message from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during commit message generation.");
    }
};