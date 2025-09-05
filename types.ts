export interface ConceptualAnalysis {
  title: string;
  description: string;
}

export interface ImprovementSuggestion {
  category: string;
  suggestions: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  relatedSuggestionCategory: string;
}

export interface UpdatePlanSection {
  title: string;
  tasks: Task[];
}

export interface CommitDetails {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface CodeChange {
  filePath: string;
  status: 'created' | 'modified' | 'deleted';
  content: string; 
}

export interface ProposedChanges {
  summary: string;
  changes: CodeChange[];
}

export interface AnalysisResult {
  conceptualAnalysis: ConceptualAnalysis;
  improvementSuggestions: ImprovementSuggestion[];
  updatePlan: UpdatePlanSection;
  commitDetails?: CommitDetails;
  proposedChanges?: ProposedChanges;
}

export interface HistoryItem {
  id: number;
  timestamp: number;
  repoUrl: string;
  result: AnalysisResult;
}

export type AppState = 'initial' | 'fetching_repo' | 'analyzing_repo' | 'results' | 'error' | 'building' | 'generating_changes' | 'reviewing_changes';

export interface RepoFile {
    path: string;
    content: string;
}

export interface RepoData {
    tree: { path: string, type: string, sha: string, size?: number }[];
    files: RepoFile[];
}
