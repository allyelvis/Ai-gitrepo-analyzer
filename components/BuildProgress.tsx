import React, { useState, useEffect } from 'react';

const buildSteps = [
  { text: 'Cloning repository conceptually...', delay: 200 },
  { text: 'Analyzing project dependencies...', delay: 500 },
  { text: 'Applying improvement patches virtually...', delay: 800 },
  { text: 'Running conceptual unit tests...', delay: 1200 },
  { text: 'Performing static analysis...', delay: 500 },
  { text: 'Finalizing build artifacts...', delay: 600 },
  { text: 'Build successful. Generating commit message...', delay: 200 },
];

const BuildProgress: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    let currentDelay = 0;
    buildSteps.forEach((step, index) => {
      currentDelay += step.delay;
      setTimeout(() => {
        setLog(prevLog => [...prevLog, step.text]);
      }, currentDelay);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-sm text-left shadow-lg">
        <div className="flex items-center pb-3 mb-3 border-b border-slate-600">
            <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="flex-1 text-center text-gray-400">build.log</span>
        </div>
        <div className="h-48 overflow-y-auto text-gray-300">
          {log.map((line, index) => (
            <p key={index} className="whitespace-pre-wrap">
              <span className="text-cyan-400 mr-2">&gt;</span>{line}
            </p>
          ))}
          <div className="inline-block h-4 w-2 bg-green-400 animate-cursor-blink ml-2" />
        </div>
      </div>
    </div>
  );
};

export default BuildProgress;