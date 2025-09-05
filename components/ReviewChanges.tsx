import React, { useState } from 'react';
import { ProposedChanges, RepoFile } from '../types';
import FileChangeItem from './FileChangeItem';

interface ReviewChangesProps {
  proposedChanges: ProposedChanges;
  originalFiles: RepoFile[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ReviewChanges: React.FC<ReviewChangesProps> = ({ proposedChanges, originalFiles, onConfirm, onCancel }) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const toggleFile = (filePath: string) => {
    setExpandedFile(prev => (prev === filePath ? null : filePath));
  };
  
  const originalFileMap = new Map(originalFiles.map(f => [f.path, f.content]));

  return (
    <div className="w-full animate-fade-in flex-grow flex flex-col">
      <header className="pb-4 border-b border-slate-700 mb-6">
        <h2 className="text-3xl font-bold text-gray-100">Review Proposed Changes</h2>
        <p className="text-gray-400 mt-1">{proposedChanges.summary}</p>
      </header>
      
      <div className="space-y-2 overflow-y-auto flex-grow pr-2">
        {proposedChanges.changes.map(change => (
          <FileChangeItem
            key={change.filePath}
            change={change}
            originalContent={originalFileMap.get(change.filePath) || ''}
            isExpanded={expandedFile === change.filePath}
            onToggle={() => toggleFile(change.filePath)}
          />
        ))}
      </div>
      
      <div className="flex justify-end items-center gap-4 pt-6 mt-auto border-t border-slate-700">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Confirm & Commit
        </button>
      </div>
    </div>
  );
};

export default ReviewChanges;
