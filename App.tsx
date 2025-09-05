import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult, AppState, HistoryItem } from './types';
import { analyzeRepo, generateImplementationPlan } from './services/geminiService';
import * as historyService from './services/historyService';
import RepoInput from './components/RepoInput';
import LoadingState from './components/LoadingState';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryPanel from './components/HistoryPanel';
import { GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Input);
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/allyelvis/aenzbi-ide.git');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGeneratingUpdate, setIsGeneratingUpdate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(historyService.getHistory());
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }
    setError(null);
    setAppState(AppState.Loading);
    setAnalysisResult(null);

    try {
      const result = await analyzeRepo(repoUrl);
      setAnalysisResult(result);
      setAppState(AppState.Results);
      const newHistory = historyService.addToHistory(repoUrl, result);
      setHistory(newHistory);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to analyze repository. ${errorMessage}`);
      setAppState(AppState.Input);
    }
  }, [repoUrl]);
  
  const handleGenerateUpdatePlan = useCallback(async () => {
    if (!analysisResult || !repoUrl) return;

    setIsGeneratingUpdate(true);
    setError(null);

    try {
      const plan = await generateImplementationPlan(repoUrl, analysisResult.suggestions.items);
      const updatedResult = { ...analysisResult, updatePlan: plan };
      setAnalysisResult(updatedResult);
      
      const newHistory = historyService.addToHistory(repoUrl, updatedResult);
      setHistory(newHistory);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate implementation plan. ${errorMessage}`);
    } finally {
      setIsGeneratingUpdate(false);
    }
  }, [analysisResult, repoUrl]);

  const handleReset = () => {
    setAppState(AppState.Input);
    setAnalysisResult(null);
    setError(null);
  };

  const handleSelectHistory = (result: AnalysisResult, url: string) => {
    setRepoUrl(url);
    setAnalysisResult(result);
    setAppState(AppState.Results);
    setError(null);
  };
  
  const handleClearHistory = () => {
    historyService.clearHistory();
    setHistory([]);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.Input:
        return <RepoInput repoUrl={repoUrl} setRepoUrl={setRepoUrl} onAnalyze={handleAnalyze} error={error} />;
      case AppState.Loading:
        return <LoadingState />;
      case AppState.Results:
        return analysisResult && (
          <ResultsDisplay 
            result={analysisResult} 
            onReset={handleReset} 
            repoUrl={repoUrl}
            isGeneratingUpdate={isGeneratingUpdate}
            onGenerateUpdate={handleGenerateUpdatePlan}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans text-gray-200 flex flex-col">
       <header className="w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <GithubIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">GitHub Repo AI Analyzer</h1>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
        <main className="flex-grow flex flex-col">
          {renderContent()}
        </main>
        <HistoryPanel 
          history={history}
          onSelectItem={handleSelectHistory}
          onClearHistory={handleClearHistory}
          isHidden={appState === AppState.Loading}
        />
      </div>

      <footer className="w-full max-w-7xl mx-auto text-center py-4 px-8 text-sm text-gray-500">
        <p>Powered by Google Gemini. This is a conceptual analysis and does not access repository code directly.</p>
      </footer>
    </div>
  );
};

export default App;