export enum AppState {
  Input = 'Input',
  Loading = 'Loading',
  Results = 'Results',
}

export interface AnalysisSection {
  title: string;
  summary: string;
  strengths: string[];
}

export interface SuggestionItem {
  category: string;
  suggestion: string;
}

export interface SuggestionsSection {
  title: string;
  items: SuggestionItem[];
}

export interface BuildStep {
  step: number;
  title: string;
  description: string;
}

export interface BuildPlanSection {
  title: string;
  steps: BuildStep[];
}

export interface ImplementationTask {
  id: number;
  title: string;
  description: string;
  relatedSuggestionCategory: string;
}

export interface UpdatePlanSection {
  title: string;
  tasks: ImplementationTask[];
}

export interface AnalysisResult {
  analysis: AnalysisSection;
  suggestions: SuggestionsSection;
  buildPlan: BuildPlanSection;
  updatePlan?: UpdatePlanSection;
}

export interface HistoryItem {
  id: number;
  repoUrl: string;
  timestamp: number;
  result: AnalysisResult;
}