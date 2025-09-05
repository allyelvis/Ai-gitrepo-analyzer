import React, { useState } from 'react';
import { ProposedChanges, RepoFile } from '../types';
import ResultCard from './ResultCard';
import FileChangeDiffItem from './FileChangeDiffItem';
import { CheckCircleIcon } from './Icons';

interface AppliedChangesProps {
  changes: ProposedChanges;
  originalFiles?: RepoFile[];
}

const AppliedChanges: React.FC<AppliedChangesProps> = ({ changes, originalFiles }) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const toggleFile = (filePath: string) => {
    setExpandedFile(prev => (prev === filePath ? null : filePath));
  };
  
  const originalFileMap = new Map(originalFiles?.map(f => [f.path, f.content]));

  return (
    <ResultCard title="Applied Changes" icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}>
        <p className="text-gray-300 mb-4 italic">{changes.summary}</p>
        <div className="space-y-2">
            {changes.changes.map(change => (
                <FileChangeDiffItem
                    key={change.filePath}
                    change={change}
                    originalContent={originalFileMap.get(change.filePath)}
                    isExpanded={expandedFile === change.filePath}
                    onToggle={() => toggleFile(change.filePath)}
                />
            ))}
        </div>
    </ResultCard>
  );
};

export default AppliedChanges;