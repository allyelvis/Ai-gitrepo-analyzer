import React from 'react';
import { CommitDetails } from '../types';
import ResultCard from './ResultCard';
import { GitCommitIcon } from './Icons';

interface CommitInfoProps {
  details: CommitDetails;
}

const CommitInfo: React.FC<CommitInfoProps> = ({ details }) => {
  const { hash, author, date, message } = details;

  return (
    <ResultCard title="Generated Commit" icon={<GitCommitIcon className="w-6 h-6 text-green-400" />}>
      <div className="font-mono text-sm">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-700">
          <div>
            <span className="text-gray-400">commit </span>
            <span className="text-yellow-400">{hash}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-gray-400">Author: </span>
            <span className="text-cyan-400">{author}</span>
          </div>
          <div>
            <span className="text-gray-400">Date: </span>
            <span className="text-gray-300">{new Date(date).toLocaleString()}</span>
          </div>
        </div>
        <pre className="text-gray-200 whitespace-pre-wrap">{message}</pre>
      </div>
    </ResultCard>
  );
};

export default CommitInfo;