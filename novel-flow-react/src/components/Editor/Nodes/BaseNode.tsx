import React from 'react';
import { Handle, Position } from 'reactflow';

interface BaseNodeProps {
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  children?: React.ReactNode;
  showSource?: boolean;
  showTarget?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  subtitle,
  icon,
  color,
  children,
  showSource = true,
  showTarget = true,
}) => {
  const colorClasses = {
    blue: { border: 'border-blue-200', bg: 'bg-blue-50', borderBottom: 'border-blue-100' },
    green: { border: 'border-green-200', bg: 'bg-green-50', borderBottom: 'border-green-100' },
    yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', borderBottom: 'border-yellow-100' },
    purple: { border: 'border-purple-200', bg: 'bg-purple-50', borderBottom: 'border-purple-100' },
    red: { border: 'border-red-200', bg: 'bg-red-50', borderBottom: 'border-red-100' },
    gray: { border: 'border-gray-200', bg: 'bg-gray-50', borderBottom: 'border-gray-100' },
  };

  const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className={`min-w-48 bg-white rounded-lg shadow-lg border-2 ${currentColors.border} hover:shadow-xl transition-shadow`}>
      {showTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}
      
      <div className={`${currentColors.bg} px-4 py-3 rounded-t-lg border-b ${currentColors.borderBottom}`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {children && (
        <div className="px-4 py-3">
          {children}
        </div>
      )}
      
      {showSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  );
};