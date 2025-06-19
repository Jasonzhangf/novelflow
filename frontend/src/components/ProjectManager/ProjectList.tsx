import React, { useEffect, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import * as ProjectTypes from '../../types/project';

interface ProjectListProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  isOpen,
  onClose,
  onProjectSelect
}) => {
  
  const {
    projectList,
    refreshProjectList,
    deleteProject,
    exportProject,
    duplicateProject,
    isLoading,
    error
  } = useProject();

  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshProjectList();
    }
  }, [isOpen, refreshProjectList]);

  const handleSelectProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      await duplicateProject(projectId);
      alert('项目复制成功！');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportProject = async (projectId: string) => {
    try {
      await exportProject(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
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
          <h2 className="text-lg font-semibold text-dark-text-primary">项目管理</h2>
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
              共 {projectList.length} 个项目
            </span>
            <button
              onClick={refreshProjectList}
              className="px-2 py-1 bg-dark-input text-dark-text-primary rounded text-xs hover:bg-dark-hover border border-dark-border"
              disabled={isLoading}
            >
              {isLoading ? '刷新中...' : '刷新'}
            </button>
          </div>
          {selectedProjects.size > 0 && (
            <div className="mt-1">
              <span className="text-xs text-dark-accent">
                已选择 {selectedProjects.size} 个
              </span>
            </div>
          )}
        </div>

        {/* 项目列表 */}
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
          ) : projectList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-dark-text-secondary text-sm">暂无项目</div>
            </div>
          ) : (
            <div className="space-y-3">
              {projectList.map((project: ProjectTypes.ProjectSummary) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-3 transition-shadow cursor-pointer 
                    ${selectedProjects.has(project.id) 
                      ? 'border-dark-accent bg-dark-input' 
                      : 'border-dark-border bg-dark-surface hover:bg-dark-input'}`
                  }
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-dark-text-primary truncate flex-1 text-sm">
                      {project.name}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="ml-2 w-4 h-4 rounded bg-dark-input border-dark-border text-dark-accent focus:ring-dark-accent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {project.description && (
                    <p className="text-xs text-dark-text-secondary mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="text-xs text-dark-text-secondary space-y-1 mb-2">
                    <div>节点: {project.nodeCount} | 连接: {project.edgeCount}</div>
                    <div>创建: {formatDate(project.createdAt)}</div>
                    <div>更新: {formatDate(project.updatedAt)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-border" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onProjectSelect(project.id)}
                      className="w-full px-2 py-1 bg-dark-accent text-dark-text-primary rounded text-xs hover:opacity-90"
                    >
                      打开
                    </button>
                    <button
                      onClick={() => handleDuplicateProject(project.id)}
                      className="w-full px-2 py-1 bg-dark-input text-dark-text-primary rounded text-xs hover:bg-dark-hover"
                    >
                      复制
                    </button>
                    <button
                      onClick={() => handleExportProject(project.id)}
                      className="w-full px-2 py-1 bg-dark-input text-dark-text-primary rounded text-xs hover:bg-dark-hover"
                    >
                      导出
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="w-full px-2 py-1 bg-red-800 text-white rounded text-xs hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 删除确认对话框 */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-[999999] bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-dark-surface p-6 rounded-lg shadow-2xl border border-dark-border w-96">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-2">确认删除</h3>
              <p className="text-dark-text-secondary mb-4">确定要删除这个项目吗？此操作无法撤销。</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 bg-dark-input text-dark-text-primary rounded hover:bg-dark-hover border border-dark-border"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return modalContent;
};