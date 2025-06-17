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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-4/5 h-4/5 max-w-6xl max-h-screen flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">项目管理</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                共 {projectList.length} 个项目
              </span>
              {selectedProjects.size > 0 && (
                <span className="text-sm text-blue-600">
                  已选择 {selectedProjects.size} 个
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={refreshProjectList}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                disabled={isLoading}
              >
                刷新
              </button>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : projectList.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">暂无项目</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectList.map((project: ProjectTypes.ProjectSummary) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedProjects.has(project.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 truncate flex-1">
                      {project.name}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="ml-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>节点: {project.nodeCount} | 连接: {project.edgeCount}</div>
                    <div>创建: {formatDate(project.createdAt)}</div>
                    <div>更新: {formatDate(project.updatedAt)}</div>
                  </div>

                  <div className="flex space-x-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onProjectSelect(project.id)}
                      className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-96">
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
};