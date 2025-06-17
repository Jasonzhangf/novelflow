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
    <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed right-4 top-16 w-80 h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">项目管理</h2>
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
              共 {projectList.length} 个
            </span>
            <button
              onClick={refreshProjectList}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              disabled={isLoading}
            >
              刷新
            </button>
          </div>
          {selectedProjects.size > 0 && (
            <div className="mt-1">
              <span className="text-xs text-blue-600">
                已选择 {selectedProjects.size} 个
              </span>
            </div>
          )}
        </div>

        {/* 项目列表 */}
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
          ) : projectList.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500 text-sm">暂无项目</div>
            </div>
          ) : (
            <div className="space-y-3">
              {projectList.map((project: ProjectTypes.ProjectSummary) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedProjects.has(project.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 truncate flex-1 text-sm">
                      {project.name}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="ml-2 w-3 h-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {project.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 space-y-1 mb-2">
                    <div>节点: {project.nodeCount} | 连接: {project.edgeCount}</div>
                    <div>创建: {formatDate(project.createdAt)}</div>
                    <div>更新: {formatDate(project.updatedAt)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onProjectSelect(project.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      打开
                    </button>
                    <button
                      onClick={() => handleDuplicateProject(project.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                    >
                      复制
                    </button>
                    <button
                      onClick={() => handleExportProject(project.id)}
                      className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                    >
                      导出
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 1000000 }}>
            <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border-2 border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <h3 className="text-lg font-semibold mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除这个项目吗？此操作无法撤销。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? '删除中...' : '确认删除'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 不使用createPortal，直接返回modal
  return modalContent;
};