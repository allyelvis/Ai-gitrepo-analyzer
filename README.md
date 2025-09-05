# GitHub Repo AI Analyzer

An AI-powered tool that analyzes GitHub repositories, suggests improvements, and generates a high-level implementation roadmap using the Google Gemini API.

## Features

-   **Real Code Analysis**: Fetches and analyzes the actual file structure and content of key files from a repository, not just a simulation.
-   **Secure Token Handling**: Requires a GitHub Personal Access Token (PAT) with 'repo' scope to access public and private repositories. The token is stored securely in your browser's local storage and is never sent anywhere else.
-   **Conceptual Overview**: Generates a high-level understanding of the project's purpose, architecture, and key components.
-   **Actionable Suggestions**: Provides concrete, categorized suggestions for improving code quality, performance, security, and more.
-   **Implementation Roadmap**: Creates a detailed, step-by-step plan of tasks to implement the suggested improvements.
-   **Simulated Commit Generation**: After analysis, it can simulate a build process and generate a conventional commit message based on the implementation plan.
-   **Analysis History**: Keeps a history of your recent analyses for easy access.

## How It Works

1.  **Authentication**: The user provides a GitHub Personal Access Token (PAT) which is saved locally in the browser.
2.  **Data Fetching**: The application uses the GitHub API to fetch the repository's file tree and the content of a curated list of important files (e.g., `package.json`, `README.md`, key source files).
3.  **AI Analysis**: The collected data is compiled into a detailed prompt and sent to the **Google Gemini API**. The prompt instructs the AI to perform a comprehensive code review.
4.  **Structured Response**: Gemini returns a structured JSON object containing the conceptual analysis, improvement suggestions, and a detailed update plan.
5.  **Display Results**: The application parses the AI's response and displays it in a clean, organized, and user-friendly interface.

## How to Use

1.  **Get a GitHub Token**: Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with the `repo` scope. This is necessary to allow the application to read repository data.
2.  **Save the Token**: In the application, click the **key icon** and paste your PAT, then click "Save Key". A green checkmark will indicate the key has been saved.
3.  **Enter URL**: Paste the URL of the GitHub repository you wish to analyze.
4.  **Analyze**: Click the "Analyze" button to begin the process. The app will show its progress as it fetches and analyzes the data.
5.  **Review & Simulate**: Review the generated analysis and improvement plan. You can then click "Simulate Build & Generate Commit" to see a conceptual commit message.

## Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI**: Google Gemini API (`gemini-2.5-flash`)
-   **APIs**: GitHub REST API

---
*This application is a demonstration of using large language models for advanced code analysis tasks. The analysis is based on a limited set of key files from the repository.*
