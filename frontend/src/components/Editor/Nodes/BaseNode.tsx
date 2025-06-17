// 这是一个基础节点组件，用于定义所有节点的通用样式和行为。
// This is a base node component that defines the common style and behavior for all nodes.
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
      
      <div 
        className={`min-w-64 rounded-lg shadow-lg border-2 ${currentColors.border} hover:shadow-xl transition-shadow`}
        style={{ backgroundColor: 'white', minWidth: '256px' }}
      >
        <div 
          className={`${currentColors.headerBg} px-4 py-3 rounded-t-lg`}
          style={{ backgroundColor: currentColors.headerBg.includes('blue') ? '#3b82f6' : 
                  currentColors.headerBg.includes('green') ? '#10b981' :
                  currentColors.headerBg.includes('yellow') ? '#f59e0b' :
                  currentColors.headerBg.includes('purple') ? '#8b5cf6' :
                  currentColors.headerBg.includes('red') ? '#ef4444' : '#6b7280' }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold`}
              style={{ backgroundColor: currentColors.iconBg.includes('blue') ? '#2563eb' : 
                      currentColors.iconBg.includes('green') ? '#059669' :
                      currentColors.iconBg.includes('yellow') ? '#d97706' :
                      currentColors.iconBg.includes('purple') ? '#7c3aed' :
                      currentColors.iconBg.includes('red') ? '#dc2626' : '#4b5563' }}
            >
              {icon}
            </div>
            <div>
              <h3 className={`font-semibold text-white text-sm`}>{title}</h3>
              {subtitle && (
                <p className={`text-xs text-white opacity-90`}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {children && (
          <div className="px-4 py-4 rounded-b-lg" style={{ backgroundColor: 'white' }}>
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