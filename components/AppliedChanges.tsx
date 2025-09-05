import React from 'react';
import { ProposedChanges } from '../types';
import ResultCard from './ResultCard';
import { CheckCircleIcon } from './Icons';

interface AppliedChangesProps {
  changes: ProposedChanges;
}

const statusStyles: { [key: string]: string } = {
    created: 'text-green-400',
    modified: 'text-blue-400',
    deleted: 'text-red-400',
};

const AppliedChanges: React.FC<AppliedChangesProps> = ({ changes }) => {
  return (
    <ResultCard title="Applied Changes" icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}>
        <p className="text-gray-300 mb-4 italic">{changes.summary}</p>
        <ul className="space-y-1 font-mono text-sm">
            {changes.changes.map(change => (
                <li key={change.filePath} className="flex items-center gap-3">
                    <span className={`w-20 text-right font-semibold ${statusStyles[change.status] || 'text-gray-400'}`}>
                        {change.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400">{change.filePath}</span>
                </li>
            ))}
        </ul>
    </ResultCard>
  );
};

export default AppliedChanges;
