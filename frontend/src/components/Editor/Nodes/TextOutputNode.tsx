import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

interface TextOutputData {
  label: string;
  content?: string;
  title?: string;
}

interface TextOutputNodeProps {
  data: TextOutputData;
  id: string;
}

export const TextOutputNode: React.FC<TextOutputNodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content || '');

  // 当data.content发生变化时更新本地状态
  React.useEffect(() => {
    if (data.content !== undefined) {
      setEditableContent(data.content);
    }
  }, [data.content]);

  const handleCloseFullscreen = () => {
    setShowFullscreen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    alert('内容已复制到剪贴板');
  };

  const handleExport = () => {
    const dataStr = editableContent;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title || '文本输出'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const truncatedContent = editableContent.length > 200 
    ? editableContent.substring(0, 200) + '...' 
    : editableContent;

  return (
    <>
      <BaseNode
        title={data.title || '文本输出'}
        icon="📄"
        id={id}
        nodeType="textOutput"
        onDelete={deleteNode}
        onDuplicate={duplicateNode}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 bg-gray-400"
        />

        <div className="p-3">
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-700">
                {data.title || '文本输出'}
              </label>
              <span className="text-xs text-gray-500">
                {editableContent.length} 字符
              </span>
            </div>
            <div 
              className="w-full p-3 border border-gray-300 rounded text-xs bg-gray-50 min-h-24 max-h-40 overflow-y-auto cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.5',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}
            >
              {truncatedContent || '暂无内容，点击节点查看侧边栏编辑器...'}
            </div>
            {editableContent.length > 200 && (
              <div className="text-xs text-gray-500 mt-1">
                显示前200字符，完整内容请在侧边栏查看
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              disabled={!editableContent}
            >
              导出
            </button>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="w-3 h-3 bg-gray-400"
        />
      </BaseNode>

      {/* 全屏显示模态框 */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-75 flex">
          {/* 主内容区域 */}
          <div className="flex-1 flex flex-col p-4">
            <div className="bg-white rounded-lg flex-1 flex flex-col overflow-hidden shadow-2xl">
              {/* 头部 */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {data.title || '文本输出'}
                </h2>
                <button
                  onClick={handleCloseFullscreen}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* 内容编辑区 */}
              <div className="flex-1 p-4">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full h-full resize-none border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="在此编辑文本内容..."
                />
              </div>
            </div>
          </div>

          {/* 右侧工具栏 */}
          <div className="w-64 p-4 flex flex-col space-y-3">
            <button
              onClick={handleCopy}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>复制全部</span>
            </button>

            <button
              onClick={handleExport}
              className="w-full px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <span>💾</span>
              <span>导出文件</span>
            </button>

            <button
              onClick={() => setEditableContent('')}
              className="w-full px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <span>🗑️</span>
              <span>清空内容</span>
            </button>

            <div className="bg-gray-800 text-white rounded p-3 text-xs">
              <h3 className="font-semibold mb-2">文本统计</h3>
              <div className="space-y-1">
                <div>字符数: {editableContent.length}</div>
                <div>行数: {editableContent.split('\n').length}</div>
                <div>词数: {editableContent.split(/\s+/).filter(word => word.length > 0).length}</div>
              </div>
            </div>

            <button
              onClick={handleCloseFullscreen}
              className="w-full px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center justify-center space-x-2"
            >
              <span>←</span>
              <span>返回</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};