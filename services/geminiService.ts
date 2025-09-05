import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UpdatePlanSection, RepoData, RepoFile, ProposedChanges } from '../types';

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
    // Define limits to prevent exceeding the API's token limit.
    const MAX_TREE_ITEMS_IN_PROMPT = 500;
    const MAX_CONTENT_CHARS_PER_FILE = 4000;

    // Truncate the file tree if it's too large.
    const isTreeTruncated = repoData.tree.length > MAX_TREE_ITEMS_IN_PROMPT;
    const treeForPrompt = isTreeTruncated ? repoData.tree.slice(0, MAX_TREE_ITEMS_IN_PROMPT) : repoData.tree;
    
    const fileTreeString = treeForPrompt.map(file => `  - ${file.path} (${file.size} bytes)`).join('\n');
    const truncationMessage = isTreeTruncated 
        ? `\n... and ${repoData.tree.length - MAX_TREE_ITEMS_IN_PROMPT} more files (tree truncated for brevity).` 
        : '';

    // Truncate the content of each file.
    const fileContentsString = repoData.files.map(file => `
---
File: ${file.path}
---
\`\`\`
${file.content.substring(0, MAX_CONTENT_CHARS_PER_FILE)}
\`\`\`
`).join('\n');


    const prompt = `
      You are an expert software engineer performing a code review and analysis.
      Analyze the GitHub repository located at: ${repoUrl}.

      I have fetched the repository's file structure and the content of key files for you.
      
      **Repository File Structure:**
      \`\`\`
      ${fileTreeString}${truncationMessage}
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
            // Check for token limit-related errors to provide a clearer message to the user.
            if (error.message.includes('token') || error.message.includes('exceeds the maximum')) {
                 throw new Error(`The repository is too large for the AI to analyze. The file structure and content exceeded the API's context size limit.`);
            }
            throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI analysis.");
    }
};

const codeChangesSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief, one-sentence summary of the changes being made." },
        changes: {
            type: Type.ARRAY,
            description: "A list of file modifications, creations, or deletions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    filePath: { type: Type.STRING, description: "The full path of the file to be changed." },
                    status: { type: Type.STRING, description: "The status of the file: 'created', 'modified', or 'deleted'." },
                    content: { type: Type.STRING, description: "The full new content of the file. For 'deleted' status, this should be an empty string." }
                },
                required: ['filePath', 'status', 'content']
            }
        }
    },
    required: ['summary', 'changes']
};


export const generateCodeChanges = async (updatePlan: UpdatePlanSection, files: RepoFile[]): Promise<ProposedChanges> => {
    const fileContentsString = files.map(file => `
---
File: ${file.path}
---
\`\`\`
${file.content}
\`\`\`
`).join('\n');

    const prompt = `
      You are an expert software engineer tasked with implementing a series of improvements to a codebase.
      I will provide you with the full content of the relevant files and an update plan.
      Your task is to generate the necessary code changes to fulfill the plan.

      **Existing File Contents:**
      ${fileContentsString}

      **Update Plan:**
      - Title: ${updatePlan.title}
      - Tasks:
      ${updatePlan.tasks.map(t => `  - ${t.title}: ${t.description}`).join('\n')}

      Please implement the tasks described in the update plan.
      - For modifications, apply the changes to the existing code.
      - If a new file is required, create it.
      - Only modify or create files that are absolutely necessary to complete the tasks.
      - Ensure the returned code is complete and correct.
      - Return your response as a single JSON object adhering to the provided schema. Do not include any other text or markdown.
    `;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: codeChangesSchema
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProposedChanges;

    } catch (error) {
        console.error("Error generating code changes:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate code changes via Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI code generation.");
    }
};


export const generateCommitMessage = async (updatePlan: UpdatePlanSection, changes?: ProposedChanges): Promise<string> => {
    
    let tasksSection: string;

    if (changes) {
         tasksSection = `
            The following changes were made:
            - Summary: ${changes.summary}
            - Files affected: ${changes.changes.map(c => `${c.filePath} (${c.status})`).join(', ')}
        `;
    } else {
        tasksSection = `
            Here are the tasks that were planned:
            ${updatePlan.tasks.map(task => `- ${task.title}: ${task.description} (Category: ${task.relatedSuggestionCategory})`).join('\n')}
        `;
    }


    const prompt = `
        Based on the following implementation summary, create a single, well-formatted conventional commit message.
        The commit message should start with a type (e.g., 'feat', 'fix', 'refactor', 'chore') and a concise summary.
        The body of the commit message should elaborate on the key changes and improvements made.
        Do not include any explanation, markdown formatting, or anything else; provide only the raw commit message text.

        ${tasksSection}
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
