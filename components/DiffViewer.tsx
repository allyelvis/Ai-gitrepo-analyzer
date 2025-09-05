import React from 'react';
import { CodeChange } from '../types';

interface DiffLine {
    type: 'added' | 'removed' | 'common';
    line: string;
}

interface DiffViewerProps {
    status: CodeChange['status'];
    oldContent?: string;
    newContent: string;
}

const generateDiff = (oldContent: string, newContent: string): DiffLine[] => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diffLines: DiffLine[] = [];
    const newLinesSet = new Set(newLines);

    let lastCommonIndexInNew = -1;

    oldLines.forEach(line => {
        if (!newLinesSet.has(line)) {
            diffLines.push({ type: 'removed', line });
        } else {
            const commonIndex = newLines.indexOf(line, lastCommonIndexInNew + 1);

            if (commonIndex !== -1) {
                for (let i = lastCommonIndexInNew + 1; i < commonIndex; i++) {
                    diffLines.push({ type: 'added', line: newLines[i] });
                }
                diffLines.push({ type: 'common', line });
                lastCommonIndexInNew = commonIndex;
            } else {
                diffLines.push({ type: 'removed', line });
            }
        }
    });

    for (let i = lastCommonIndexInNew + 1; i < newLines.length; i++) {
        diffLines.push({ type: 'added', line: newLines[i] });
    }

    return diffLines;
};


const DiffViewer: React.FC<DiffViewerProps> = ({ status, oldContent, newContent }) => {

    let lines: DiffLine[] = [];
    
    if (status === 'created') {
        lines = newContent.split('\n').map(line => ({ type: 'added', line }));
    } else if (status === 'deleted') {
        if (typeof oldContent === 'string') {
             lines = oldContent.split('\n').map(line => ({ type: 'removed', line }));
        } else {
            return <div className="p-4 text-gray-500 italic">Original content for deleted file not available.</div>;
        }
    } else if (status === 'modified') {
        if (typeof oldContent === 'string') {
            lines = generateDiff(oldContent, newContent);
        } else {
            // Fallback for history items where old content isn't available
            lines = newContent.split('\n').map(line => ({ type: 'common', line }));
        }
    }

    return (
        <pre className="text-sm text-gray-300 overflow-x-auto font-mono bg-transparent">
            <code>
                {lines.map((item, index) => {
                    let lineClass = '';
                    let prefix = '  ';
                    if (item.type === 'added') {
                        lineClass = 'bg-green-900/40';
                        prefix = '+ ';
                    } else if (item.type === 'removed') {
                        lineClass = 'bg-red-900/40';
                        prefix = '- ';
                    }
                    return (
                        <div key={index} className={`px-4 ${lineClass}`}>
                            <span className={item.type === 'added' ? 'text-green-400' : item.type === 'removed' ? 'text-red-400' : 'text-gray-500'}>
                                {prefix}
                            </span>
                            <span>{item.line}</span>
                        </div>
                    )
                })}
            </code>
        </pre>
    );
};

export default DiffViewer;
