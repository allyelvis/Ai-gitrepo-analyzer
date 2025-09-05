import { HistoryItem, AnalysisResult } from '../types';

const HISTORY_KEY = 'repoAnalyzerHistory';
const MAX_HISTORY_ITEMS = 20;

export const getHistory = (): HistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      // Basic validation to ensure it's an array
      if (Array.isArray(parsedHistory)) {
        return parsedHistory;
      }
    }
  } catch (error) {
    console.error("Failed to parse history from localStorage:", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
  }
  return [];
};

export const addToHistory = (repoUrl: string, result: AnalysisResult): HistoryItem[] => {
  const currentHistory = getHistory();
  // Filter out any previous entry for the same repository URL
  const filteredHistory = currentHistory.filter(item => item.repoUrl !== repoUrl);

  const newItem: HistoryItem = {
    id: Date.now(),
    timestamp: Date.now(),
    repoUrl,
    result,
  };

  // Add the new item to the beginning of the array
  const newHistory = [newItem, ...filteredHistory];

  // Limit the history size to the most recent items
  if (newHistory.length > MAX_HISTORY_ITEMS) {
    newHistory.splice(MAX_HISTORY_ITEMS);
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save history to localStorage:", error);
  }

  return newHistory;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history from localStorage:", error);
  }
};
