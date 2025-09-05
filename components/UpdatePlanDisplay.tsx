import React from 'react';
import { UpdatePlanSection } from '../types';
import ResultCard from './ResultCard';
import { ClipboardListIcon, TagIcon } from './Icons';

interface UpdatePlanDisplayProps {
  plan: UpdatePlanSection;
}

const UpdatePlanDisplay: React.FC<UpdatePlanDisplayProps> = ({ plan }) => {
  return (
    <ResultCard title={plan.title} icon={<ClipboardListIcon className="w-6 h-6 text-teal-400" />}>
      <div className="space-y-4">
        {plan.tasks.map((task) => (
          <div key={task.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-200">{task.title}</h4>
              <div className="flex items-center gap-1.5 bg-slate-700 text-teal-300 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                <TagIcon className="w-3 h-3" />
                {task.relatedSuggestionCategory}
              </div>
            </div>
            <p className="text-gray-400">{task.description}</p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
};

export default UpdatePlanDisplay;