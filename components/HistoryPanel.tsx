import React from 'react';
import { HistoryItem, AnalysisResult } from '../types';
import { HistoryIcon, TrashIcon } from './Icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (result: AnalysisResult, repoUrl: string) => void;
  onClearHistory: () => void;
  isHidden: boolean;
}

const getRepoName = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    // Remove leading slash and optional .git extension
    return path.substring(1).replace(/\.git$/, '');
  } catch (e) {
    // Fallback for invalid URLs
    return url.split('/').slice(-2).join('/');
  }
};

const formatRelativeTime = (timestamp: number): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClearHistory, isHidden }) => {
  if (isHidden) {
      return null;
  }
  
  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-slate-850 border border-slate-700 rounded-lg shadow-lg h-full flex flex-col">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5" />
              History
            </h3>
            {history.length > 0 && (
               <button 
                onClick={onClearHistory} 
                className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-md text-xs flex items-center gap-1"
                aria-label="Clear history"
               >
                <TrashIcon className="w-4 h-4" /> Clear
               </button>
            )}
          </div>
          <div className="p-2 overflow-y-auto flex-grow">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 pt-8 text-sm">
                No analyses yet.
              </div>
            ) : (
              <ul className="space-y-1">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectItem(item.result, item.repoUrl)}
                      className="w-full text-left p-3 rounded-md hover:bg-slate-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <p className="font-semibold text-gray-200 truncate">{getRepoName(item.repoUrl)}</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(item.timestamp)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
    </aside>
  );
};

export default HistoryPanel;
