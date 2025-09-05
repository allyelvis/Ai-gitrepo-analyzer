import React, { useState, useEffect } from 'react';
import RepoInput from './components/RepoInput';
import LoadingState from './components/LoadingState';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryPanel from './components/HistoryPanel';
import BuildProgress from './components/BuildProgress';
import { analyzeRepository, generateCommitMessage } from './services/geminiService';
import { getRepositoryContents } from './services/githubService';
import { addToHistory, getHistory, clearHistory as clearHistoryService } from './services/historyService';
import { saveApiKey, getApiKey } from './services/apiKeyService';
import { AnalysisResult, AppState, HistoryItem, CommitDetails } from './types';
import { GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [githubApiKey, setGithubApiKey] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
    const key = getApiKey();
    if (key) {
      setGithubApiKey(key);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }
    if (!githubApiKey) {
      setError('A GitHub API Key is required. Please add one.');
      return;
    }

    setAppState('fetching_repo');
    setError(null);
    setCurrentResult(null);

    try {
      const repoData = await getRepositoryContents(repoUrl, githubApiKey);

      setAppState('analyzing_repo');
      const result = await analyzeRepository(repoUrl, repoData);
      
      setCurrentResult(result);
      const newHistory = addToHistory(repoUrl, result);
      setHistory(newHistory);
      setAppState('results');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
      setAppState('error');
    }
  };
  
  const handleSaveApiKey = (key: string) => {
    saveApiKey(key);
    setGithubApiKey(key);
    setError(null); // Clear error messages when a new key is saved
  };

  const handleBuildAndCommit = async () => {
    if (!currentResult) return;
    
    setAppState('building');

    setTimeout(async () => {
      try {
        const commitMessage = await generateCommitMessage(currentResult.updatePlan);

        const commitDetails: CommitDetails = {
          hash: crypto.randomUUID().substring(0, 7),
          author: 'AI Developer',
          date: new Date().toISOString(),
          message: commitMessage,
        };

        const updatedResult = { ...currentResult, commitDetails };
        setCurrentResult(updatedResult);
        const newHistory = addToHistory(repoUrl, updatedResult);
        setHistory(newHistory);

        setAppState('results');

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate commit message: ${errorMessage}`);
        setAppState('error');
      }
    }, 4000);
  };

  const handleSelectHistoryItem = (result: AnalysisResult, url: string) => {
    setCurrentResult(result);
    setRepoUrl(url);
    setAppState('results');
    setError(null);
  };
  
  const handleClearHistory = () => {
      clearHistoryService();
      setHistory([]);
      if(appState !== 'results'){
        handleNewAnalysis();
      }
  }

  const handleNewAnalysis = () => {
    setAppState('initial');
    setCurrentResult(null);
    setRepoUrl('');
    setError(null);
  }

  const renderContent = () => {
    switch (appState) {
      case 'fetching_repo':
      case 'analyzing_repo':
        return <LoadingState stage={appState} />;
      case 'building':
        return <BuildProgress />;
      case 'results':
        return currentResult ? (
            <ResultsDisplay
              result={currentResult}
              repoUrl={repoUrl}
              onBuildAndCommit={handleBuildAndCommit}
            />
        ) : <p>Something went wrong loading the results.</p>;
      case 'error':
      case 'initial':
      default:
        return <RepoInput 
            repoUrl={repoUrl} 
            setRepoUrl={setRepoUrl} 
            onAnalyze={handleAnalyze} 
            error={error} 
            onSaveApiKey={handleSaveApiKey}
            hasApiKey={!!githubApiKey}
        />;
    }
  };
  
  return (
    <div className="bg-slate-900 min-h-screen text-gray-200 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <GithubIcon className="w-8 h-8 text-cyan-400" />
             <h1 className="text-2xl font-bold text-gray-100">Repo-Analyzer</h1>
          </div>
          {appState === 'results' && (
             <button
              onClick={handleNewAnalysis}
              className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-200"
            >
              New Analysis
            </button>
          )}
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow">
              <div className="bg-slate-850 border border-slate-700 rounded-lg shadow-lg p-8 min-h-[60vh] flex flex-col justify-center">
                {renderContent()}
              </div>
            </div>
          
            <HistoryPanel 
                history={history} 
                onSelectItem={handleSelectHistoryItem} 
                onClearHistory={handleClearHistory}
                isHidden={appState === 'building'}
            />
        </main>

         <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Google Gemini. Analysis is based on a limited set of key files from the repository.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;