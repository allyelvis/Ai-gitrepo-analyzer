// FIX: Removed triple-slash directive for vitest. Type definitions are inferred from the import.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeRepository, generateCommitMessage } from './geminiService';
import { RepoData, UpdatePlanSection, AnalysisResult } from '../types';

// Mock the @google/genai module
const mockGenerateContent = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
  },
}));

// Mock Data
const mockRepoData: RepoData = {
  tree: [
    { path: 'src/index.ts', type: 'blob', sha: '123', size: 100 },
    { path: 'package.json', type: 'blob', sha: '456', size: 200 },
  ],
  files: [
    { path: 'src/index.ts', content: 'console.log("hello");' },
    { path: 'package.json', content: '{ "name": "test-repo" }' },
  ],
};

const mockAnalysisResult: AnalysisResult = {
  conceptualAnalysis: { title: 'Test Analysis', description: 'A test project.' },
  improvementSuggestions: [],
  updatePlan: { title: 'Test Plan', tasks: [] },
};

describe('geminiService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGenerateContent.mockReset();
  });

  describe('analyzeRepository', () => {
    it('should return a valid analysis result on successful API call', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockAnalysisResult),
      });

      const result = await analyzeRepository('https://github.com/test/repo', mockRepoData);

      expect(result).toEqual(mockAnalysisResult);
      expect(mockGenerateContent).toHaveBeenCalledOnce();
      const callOptions = mockGenerateContent.mock.calls[0][0];
      expect(callOptions.contents).toContain('Analyze the GitHub repository located at: https://github.com/test/repo');
      expect(callOptions.contents).toContain('- src/index.ts (100 bytes)');
      expect(callOptions.contents).toContain('File: src/index.ts');
      expect(callOptions.contents).toContain('console.log("hello");');
    });

    it('should throw a specific error for token limit issues', async () => {
      const tokenError = new Error('The input token count exceeds the maximum');
      mockGenerateContent.mockRejectedValue(tokenError);

      await expect(analyzeRepository('https://github.com/test/repo', mockRepoData))
        .rejects
        .toThrow('The repository is too large for the AI to analyze. The file structure and content exceeded the API\'s context size limit.');
    });

    it('should throw a generic error for other API failures', async () => {
        const apiError = new Error('API key not valid');
        mockGenerateContent.mockRejectedValue(apiError);

        await expect(analyzeRepository('https://github.com/test/repo', mockRepoData))
            .rejects
            .toThrow('Failed to get analysis from Gemini API: API key not valid');
    });

    it('should throw an error if the response is not valid JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'This is not JSON',
      });
      // The service wraps JSON.parse in the main try/catch, so it will be caught
      // by the generic error handler.
      await expect(analyzeRepository('https://github.com/test/repo', mockRepoData))
        .rejects
        .toThrow(/Failed to get analysis from Gemini API/);
    });

    it('should handle truncated file trees in the prompt', async () => {
        const largeTree = Array.from({ length: 600 }, (_, i) => ({
            path: `file${i}.js`, type: 'blob', sha: `${i}`, size: 10
        }));
        const largeRepoData = { ...mockRepoData, tree: largeTree };

        mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockAnalysisResult) });

        await analyzeRepository('https://github.com/test/repo', largeRepoData);

        expect(mockGenerateContent).toHaveBeenCalledOnce();
        const prompt = mockGenerateContent.mock.calls[0][0].contents;
        expect(prompt).toContain('... and 100 more files (tree truncated for brevity).');
    });
  });

  describe('generateCommitMessage', () => {
    const mockUpdatePlan: UpdatePlanSection = {
      title: 'Implementation Plan',
      tasks: [
        { id: 't1', title: 'Refactor service', description: 'Improve service layer', relatedSuggestionCategory: 'Code Quality' },
        { id: 't2', title: 'Add tests', description: 'Increase test coverage', relatedSuggestionCategory: 'Testing' },
      ],
    };

    it('should return a commit message on successful API call', async () => {
        const expectedMessage = 'feat: Implement improvements based on AI analysis';
        mockGenerateContent.mockResolvedValue({
            text: ` ${expectedMessage} `, // With extra whitespace to test trimming
        });

        const result = await generateCommitMessage(mockUpdatePlan);

        expect(result).toBe(expectedMessage);
        expect(mockGenerateContent).toHaveBeenCalledOnce();
        const prompt = mockGenerateContent.mock.calls[0][0].contents;
        expect(prompt).toContain('create a single, well-formatted conventional commit message');
        expect(prompt).toContain('- Refactor service: Improve service layer (Category: Code Quality)');
        expect(prompt).toContain('- Add tests: Increase test coverage (Category: Testing)');
    });

    it('should throw a generic error for API failures', async () => {
        const apiError = new Error('Request failed');
        mockGenerateContent.mockRejectedValue(apiError);

        await expect(generateCommitMessage(mockUpdatePlan))
            .rejects
            .toThrow('Failed to get commit message from Gemini API: Request failed');
    });
  });
});