// 这是一个基础节点组件，用于定义所有节点的通用样式和行为。
// This is a base node component that defines the common style and behavior for all nodes.
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css'; // 导入新的CSS文件

interface BaseNodeProps {
  title: string;
  subtitle?: string; // Subtitle can be kept if needed, but the new design doesn't explicitly have a place for it in the header.
  icon: React.ReactNode; // Changed to ReactNode to allow for more flexible icons
  children?: React.ReactNode;
  showSource?: boolean;
  showTarget?: boolean;
  id?: string;
  nodeType?: string;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  // subtitle,
  icon,
  children,
  showSource = true,
  showTarget = true,
  id,
  nodeType,
  onDelete,
  onDuplicate,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // 只有非场景节点才显示右键菜单
    if (nodeType === 'scene') return;
    
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }, [nodeType]);

  const handleDelete = useCallback(() => {
    if (id && onDelete) {
      onDelete(id);
    }
    setShowContextMenu(false);
  }, [id, onDelete]);

  const handleDuplicate = useCallback(() => {
    if (id && onDuplicate) {
      onDuplicate(id);
    }
    setShowContextMenu(false);
  }, [id, onDuplicate]);

  const handleCloseMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  return (
    <>
      <div className="node-common interactive-node" onContextMenu={handleContextMenu}>
        {showTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 !bg-gray-400 border-2 border-white !top-[-6px] !left-1/2 !transform !-translate-x-1/2"
          />
        )}
        
        <div className="node-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{icon}</span>
            <span>{title}</span>
          </div>
        </div>
        
        {children && (
          <div className="node-content">
            {children}
          </div>
        )}
      
        {showSource && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 !bg-gray-400 border-2 border-white !bottom-[-6px] !left-1/2 !transform !-translate-x-1/2"
          />
        )}
      </div>

      {/* 右键菜单 */}
      {showContextMenu && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-[999998]"
            onClick={handleCloseMenu}
          />
          
          {/* 菜单内容 */}
          <div
            className="fixed z-[999999] bg-dark-surface border border-dark-border rounded-md shadow-lg py-1 min-w-[150px]"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-2 text-left text-sm text-dark-text-primary hover:bg-dark-input flex items-center space-x-2"
            >
              <span className="text-base">📋</span>
              <span>复制</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-dark-input flex items-center space-x-2"
            >
              <span className="text-base">🗑️</span>
              <span>删除</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};