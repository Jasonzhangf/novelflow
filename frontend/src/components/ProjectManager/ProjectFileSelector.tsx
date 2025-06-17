import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProject } from '../../hooks/useProject';

interface ProjectFileInfo {
  fileName: string;
  projectName: string;
  projectId: string;
  lastModified: string;
  fileSize: number;
}

interface ProjectFileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (projectId: string) => void;
}

export const ProjectFileSelector: React.FC<ProjectFileSelectorProps> = ({
  isOpen,
  onClose,
  onProjectSelect
}) => {
  const { getProjectFiles, isLoading, error } = useProject();
  const [projectFiles, setProjectFiles] = useState<ProjectFileInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProjectFiles();
    }
  }, [isOpen]);

  const loadProjectFiles = async () => {
    try {
      const files = await getProjectFiles();
      setProjectFiles(files);
    } catch (error) {
      console.error('Failed to load project files:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999]" onClick={onClose}>
      <div 
        className="fixed right-4 top-16 w-96 h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">选择项目文件</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              共 {projectFiles.length} 个文件
            </span>
            <button
              onClick={loadProjectFiles}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              disabled={isLoading}
            >
              刷新
            </button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="flex-1 overflow-auto p-3">
          {error && (
            <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500 text-sm">加载中...</div>
            </div>
          ) : projectFiles.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500 text-sm">暂无项目文件</div>
            </div>
          ) : (
            <div className="space-y-2">
              {projectFiles.map((file: ProjectFileInfo, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    onProjectSelect(file.projectId);
                    onClose();
                  }}
                >
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {file.projectName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {file.fileName}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>修改时间: {formatDate(file.lastModified)}</div>
                    <div>文件大小: {formatFileSize(file.fileSize)}</div>
                    <div>项目ID: {file.projectId}</div>
                  </div>

                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectSelect(file.projectId);
                        onClose();
                      }}
                      className="w-full px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      打开项目
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};