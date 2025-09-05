import React from 'react';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-850 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
      <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex items-center gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
