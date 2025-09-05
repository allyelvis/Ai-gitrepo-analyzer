import React from 'react';
import { AnalysisResult, SuggestionItem, BuildStep } from '../types';
import ResultCard from './ResultCard';
import UpdatePlanDisplay from './UpdatePlanDisplay';
import { AnalysisIcon, LightbulbIcon, RoadmapIcon, CheckCircleIcon, TagIcon, ClipboardListIcon } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  repoUrl: string;
  isGeneratingUpdate: boolean;
  onGenerateUpdate: () => void;
}

const CategoryTag: React.FC<{ category: string }> = ({ category }) => (
    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-700 text-cyan-300 text-xs font-medium px-2 py-1 rounded-full">
        <TagIcon className="w-3 h-3" />
        {category}
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset, repoUrl, isGeneratingUpdate, onGenerateUpdate }) => {
  const { analysis, suggestions, buildPlan, updatePlan } = result;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-850">
        <h2 className="text-2xl font-bold text-gray-100">Analysis Complete</h2>
        <p className="text-gray-400 mt-1 truncate">
          Showing results for: <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{repoUrl}</a>
        </p>
      </div>

      <ResultCard title={analysis.title} icon={<AnalysisIcon className="w-6 h-6 text-cyan-400" />}>
        <p className="text-gray-300 mb-6">{analysis.summary}</p>
        <h4 className="font-semibold text-gray-200 mb-3">Potential Strengths:</h4>
        <ul className="space-y-2">
          {analysis.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-gray-300">{strength}</span>
            </li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title={suggestions.title} icon={<LightbulbIcon className="w-6 h-6 text-yellow-400" />}>
        <div className="space-y-6">
          {suggestions.items.map((item: SuggestionItem, index: number) => (
            <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative">
              <CategoryTag category={item.category} />
              <p className="text-gray-300">{item.suggestion}</p>
            </div>
          ))}
        </div>
        {!updatePlan && (
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              onClick={onGenerateUpdate}
              disabled={isGeneratingUpdate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-teal-900/50 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isGeneratingUpdate ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ClipboardListIcon className="w-5 h-5" />
                  <span>Generate Implementation Plan</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">Create a step-by-step plan to action these suggestions.</p>
          </div>
        )}
      </ResultCard>

      {updatePlan && <UpdatePlanDisplay plan={updatePlan} />}

      <ResultCard title={buildPlan.title} icon={<RoadmapIcon className="w-6 h-6 text-indigo-400" />}>
        <div className="space-y-4">
          {buildPlan.steps.map((step: BuildStep, index: number) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center font-bold text-lg border border-indigo-500">
                {step.step}
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">{step.title}</h4>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ResultCard>

      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-slate-700 text-gray-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200"
        >
          Analyze Another Repository
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;