import React, { useState, useEffect } from 'react';

const steps = [
    'Initializing code generation...',
    'AI is reviewing the implementation plan...',
    'Writing new code and functions...',
    'Applying virtual patches to existing files...',
    'Running conceptual validation...',
    'Finalizing code changes...',
];

const GeneratingChangesState: React.FC = () => {
  const [message, setMessage] = useState(steps[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
        index = (index + 1) % steps.length;
        setMessage(steps[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 border-4 border-t-indigo-400 border-slate-700 rounded-full animate-spin"></div>
        <h2 className="text-3xl font-bold text-gray-100">Generating Code...</h2>
      </div>
      <p className="text-lg text-gray-400 transition-opacity duration-500">
        {message}
      </p>
    </div>
  );
};

export default GeneratingChangesState;
