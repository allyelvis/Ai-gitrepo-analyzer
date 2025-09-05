import React, { useState, useEffect } from 'react';

const loadingMessages = [
  'Initializing AI core...',
  'Forking repository conceptually...',
  'Analyzing code structure and architecture...',
  'Identifying potential strengths...',
  'Brewing improvement suggestions...',
  'Formulating implementation roadmap...',
  'Finalizing analysis...',
];

const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 border-4 border-t-cyan-400 border-slate-700 rounded-full animate-spin"></div>
        <h2 className="text-3xl font-bold text-gray-100">Analyzing...</h2>
      </div>
      <p className="text-lg text-gray-400 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingState;
