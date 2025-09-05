import React from 'react';
import { AnalysisResult, RepoFile } from '../types';
import UpdatePlanDisplay from './UpdatePlanDisplay';
import ResultCard from './ResultCard';
import CommitInfo from './CommitInfo';
import AppliedChanges from './AppliedChanges';
import { BrainCircuitIcon, LightbulbIcon, TerminalIcon } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult;
  repoUrl: string;
  onImplement: () => void;
  originalFiles?: RepoFile[];
}

const getRepoName = (url: string): string => {
  try {
    const path = new URL(url).pathname;
    return path.substring(1).replace(/\.git$/, '');
  } catch (e) {
    return url.split('/').slice(-2).join('/');
  }
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, repoUrl, onImplement, originalFiles }) => {
  const { conceptualAnalysis, improvementSuggestions, updatePlan, commitDetails, proposedChanges } = result;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="pb-4 border-b border-slate-700">
        <h2 className="text-3xl font-bold text-gray-100">Analysis for <span className="text-cyan-400 break-all">{getRepoName(repoUrl)}</span></h2>
      </header>
      
      <ResultCard title={conceptualAnalysis.title} icon={<BrainCircuitIcon className="w-6 h-6 text-indigo-400" />}>
        <p className="text-gray-300 whitespace-pre-wrap">{conceptualAnalysis.description}</p>
      </ResultCard>

      <ResultCard title="Improvement Suggestions" icon={<LightbulbIcon className="w-6 h-6 text-amber-400" />}>
        <div className="space-y-6">
          {improvementSuggestions.map((category) => (
            <div key={category.category}>
              <h4 className="font-semibold text-lg text-gray-200 mb-2">{category.category}</h4>
              <ul className="list-disc list-inside space-y-2 pl-2">
                {category.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-400">{suggestion}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ResultCard>

      <UpdatePlanDisplay plan={updatePlan} />

      {commitDetails ? (
        <>
            {proposedChanges && <AppliedChanges changes={proposedChanges} originalFiles={originalFiles}/>}
            <CommitInfo details={commitDetails} />
        </>
      ) : (
        <div className="pt-4 text-center">
            <button
                onClick={onImplement}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-indigo-900/50"
            >
                <TerminalIcon className="w-6 h-6" />
                Implement Suggestions
            </button>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;