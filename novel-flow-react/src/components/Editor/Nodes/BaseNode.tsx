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
    blue: { 
      headerBg: 'bg-blue-500', 
      headerText: 'text-white',
      iconBg: 'bg-blue-600',
      border: 'border-blue-200'
    },
    green: { 
      headerBg: 'bg-green-500', 
      headerText: 'text-white',
      iconBg: 'bg-green-600',
      border: 'border-green-200'
    },
    yellow: { 
      headerBg: 'bg-yellow-500', 
      headerText: 'text-white',
      iconBg: 'bg-yellow-600',
      border: 'border-yellow-200'
    },
    purple: { 
      headerBg: 'bg-purple-500', 
      headerText: 'text-white',
      iconBg: 'bg-purple-600',
      border: 'border-purple-200'
    },
    red: { 
      headerBg: 'bg-red-500', 
      headerText: 'text-white',
      iconBg: 'bg-red-600',
      border: 'border-red-200'
    },
    gray: { 
      headerBg: 'bg-gray-500', 
      headerText: 'text-white',
      iconBg: 'bg-gray-600',
      border: 'border-gray-200'
    },
  };

  const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className="relative">
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 border-2 border-white !top-[-6px] !left-1/2 !transform !-translate-x-1/2"
        />
      )}
      
      <div className={`min-w-64 bg-white rounded-lg shadow-lg border ${currentColors.border} hover:shadow-xl transition-shadow`}>
        <div className={`${currentColors.headerBg} px-4 py-3 rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${currentColors.iconBg} rounded-md flex items-center justify-center text-white text-sm font-bold`}>
              {icon}
            </div>
            <div>
              <h3 className={`font-semibold ${currentColors.headerText} text-sm`}>{title}</h3>
              {subtitle && (
                <p className={`text-xs ${currentColors.headerText} opacity-90`}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {children && (
          <div className="px-4 py-4 bg-white rounded-b-lg">
            {children}
          </div>
        )}
      </div>
      
      {showSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400 border-2 border-white !bottom-[-6px] !left-1/2 !transform !-translate-x-1/2"
        />
      )}
    </div>
  );
};