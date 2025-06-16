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
    blue: { border: 'border-blue-200', bg: 'bg-blue-50', borderBottom: 'border-blue-100' },
    green: { border: 'border-green-200', bg: 'bg-green-50', borderBottom: 'border-green-100' },
    yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', borderBottom: 'border-yellow-100' },
    purple: { border: 'border-purple-200', bg: 'bg-purple-50', borderBottom: 'border-purple-100' },
    red: { border: 'border-red-200', bg: 'bg-red-50', borderBottom: 'border-red-100' },
    gray: { border: 'border-gray-200', bg: 'bg-gray-50', borderBottom: 'border-gray-100' },
  };

  const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className={`min-w-48 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all`}>
      {showTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 !bg-slate-300 hover:!bg-slate-400 border-2 border-white"
        />
      )}
      
      <div className={`px-4 py-3`}>
        <div className="flex items-center space-x-3">
          <span className="text-xl text-slate-500">{icon}</span>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {children && (
        <div className="px-4 py-3 text-sm text-slate-600 border-t border-slate-200">
          {children}
        </div>
      )}
      
      {showSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 !bg-slate-300 hover:!bg-slate-400 border-2 border-white"
        />
      )}
    </div>
  );
};