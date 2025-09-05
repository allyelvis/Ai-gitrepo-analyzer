import React from 'react';
import { CodeChange } from '../types';
import DiffViewer from './DiffViewer';

interface FileChangeDiffItemProps {
  change: CodeChange;
  originalContent?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const statusStyles = {
    created: 'bg-green-800/50 text-green-300 border-green-700/50',
    modified: 'bg-blue-800/50 text-blue-300 border-blue-700/50',
    deleted: 'bg-red-800/50 text-red-300 border-red-700/50',
};

const FileChangeDiffItem: React.FC<FileChangeDiffItemProps> = ({ change, originalContent, isExpanded, onToggle }) => {
  const statusStyle = statusStyles[change.status] || 'bg-slate-700 text-slate-300';

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-800/60 transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${statusStyle}`}>
                {change.status.toUpperCase()}
            </span>
            <span className="font-mono text-gray-300">{change.filePath}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="bg-slate-900/70">
           <DiffViewer 
              status={change.status}
              oldContent={originalContent}
              newContent={change.content}
           />
        </div>
      )}
    </div>
  );
};

export default FileChangeDiffItem;
