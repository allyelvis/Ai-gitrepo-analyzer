import React from 'react';
import { AnalyzeIcon } from './Icons';

interface RepoInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: () => void;
  error: string | null;
}

const RepoInput: React.FC<RepoInputProps> = ({ repoUrl, setRepoUrl, onAnalyze, error }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">Analyze Your Repository</h2>
        <p className="text-lg text-gray-400 mb-8">
          Enter a public GitHub repository URL to get an AI-powered conceptual analysis, improvement suggestions, and a build roadmap.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-900/50"
          >
            <AnalyzeIcon className="w-5 h-5" />
            Analyze
          </button>
        </form>
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
};

export default RepoInput;
