import React, { useState } from 'react';
import { AnalyzeIcon, KeyIcon, CheckCircleIcon } from './Icons';

interface RepoInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: () => void;
  error: string | null;
  onSaveApiKey: (key: string) => void;
  hasApiKey: boolean;
}

const RepoInput: React.FC<RepoInputProps> = ({ repoUrl, setRepoUrl, onAnalyze, error, onSaveApiKey, hasApiKey }) => {
  const [isKeyInputVisible, setIsKeyInputVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(hasApiKey) {
        onAnalyze();
    }
  };

  const handleSaveClick = () => {
    onSaveApiKey(apiKey);
    setIsKeyInputVisible(false);
    setApiKey(''); // Clear the input after saving
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">Real Code Analysis</h2>
        <p className="text-lg text-gray-400 mb-8">
          Provide a GitHub Personal Access Token with 'repo' access, then enter a repository URL to get an AI-powered code analysis and implementation plan.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-full relative">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200"
              aria-label="Repository URL"
            />
             <button
                type="button"
                onClick={() => setIsKeyInputVisible(!isKeyInputVisible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-cyan-400 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
                aria-label={hasApiKey ? "API Key is set" : "Set API Key"}
              >
                {hasApiKey ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <KeyIcon className="w-6 h-6" />
                )}
              </button>
          </div>
          <button
            type="submit"
            disabled={!hasApiKey}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-900/50 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <AnalyzeIcon className="w-5 h-5" />
            Analyze
          </button>
        </form>
        {isKeyInputVisible && (
            <div className="w-full max-w-2xl mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-left animate-fade-in">
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">GitHub Personal Access Token</label>
                <div className="flex gap-2">
                    <input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="ghp_..."
                        className="flex-grow px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-gray-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                    <button onClick={handleSaveClick} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-500 transition-colors">
                        Save Key
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Your key is stored only in your browser's local storage. A token with 'repo' scope is required to read repository contents.
                    {' '}
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                        Create one here.
                    </a>
                </p>
            </div>
        )}
        {!hasApiKey && <p className="mt-4 text-amber-400 text-sm">A GitHub API Key is required to analyze repositories. Click the key icon to add one.</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
};

export default RepoInput;