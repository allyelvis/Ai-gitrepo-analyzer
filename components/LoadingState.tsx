import React from 'react';

interface LoadingStateProps {
    stage: 'fetching_repo' | 'analyzing_repo';
}

const messages = {
    fetching_repo: 'Fetching repository data from GitHub...',
    analyzing_repo: 'Analyzing repository with Gemini AI...',
};

const LoadingState: React.FC<LoadingStateProps> = ({ stage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 border-4 border-t-cyan-400 border-slate-700 rounded-full animate-spin"></div>
        <h2 className="text-3xl font-bold text-gray-100">Analyzing...</h2>
      </div>
      <p className="text-lg text-gray-400 transition-opacity duration-500">
        {messages[stage]}
      </p>
    </div>
  );
};

export default LoadingState;