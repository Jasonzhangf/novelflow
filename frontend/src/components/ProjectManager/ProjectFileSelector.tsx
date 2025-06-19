import React, { useEffect, useState, useCallback } from 'react';
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

  const loadProjectFiles = useCallback(async () => {
    try {
      const files = await getProjectFiles();
      setProjectFiles(files);
    } catch (error) {
      console.error('Failed to load project files:', error);
    }
  }, [getProjectFiles]);

  useEffect(() => {
    if (isOpen) {
      loadProjectFiles();
    }
  }, [isOpen, loadProjectFiles]);

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
    <div className="fixed inset-0 z-[999999] bg-black bg-opacity-70 flex items-center justify-center" onClick={onClose}>
      <div 
        className="w-[600px] h-[80vh] bg-dark-surface rounded-lg shadow-2xl border border-dark-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-dark-text-primary">选择项目文件</h2>
          <button
            onClick={onClose}
            className="text-dark-text-secondary hover:text-dark-text-primary text-xl"
          >
            ✕
          </button>
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-2 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-text-secondary">
              共 {projectFiles.length} 个文件
            </span>
            <button
              onClick={loadProjectFiles}
              className="px-2 py-1 bg-dark-input text-dark-text-primary rounded text-xs hover:bg-dark-hover border border-dark-border"
              disabled={isLoading}
            >
              {isLoading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="flex-1 overflow-auto p-3">
          {error && (
            <div className="mb-2 p-2 bg-red-800 border border-red-600 rounded text-white text-xs">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-dark-text-secondary text-sm">加载中...</div>
            </div>
          ) : projectFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-dark-text-secondary text-sm">暂无项目文件</div>
            </div>
          ) : (
            <div className="space-y-2">
              {projectFiles.map((file: ProjectFileInfo, index) => (
                <div
                  key={index}
                  className="border border-dark-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-dark-surface hover:bg-dark-input"
                  onClick={() => {
                    onProjectSelect(file.projectId);
                    onClose();
                  }}
                >
                  <div className="mb-2">
                    <h3 className="font-semibold text-dark-text-primary text-sm truncate">
                      {file.projectName}
                    </h3>
                    <p className="text-xs text-dark-text-secondary truncate">
                      {file.fileName}
                    </p>
                  </div>

                  <div className="text-xs text-dark-text-secondary space-y-1">
                    <div>修改时间: {formatDate(file.lastModified)}</div>
                    <div>文件大小: {formatFileSize(file.fileSize)}</div>
                    <div className="truncate">项目ID: {file.projectId}</div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dark-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectSelect(file.projectId);
                        onClose();
                      }}
                      className="w-full px-2 py-1 bg-dark-accent text-dark-text-primary rounded text-xs hover:opacity-90"
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

  return modalContent;
};