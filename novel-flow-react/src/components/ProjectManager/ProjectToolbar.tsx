import React, { useState, useRef } from 'react';
import { useProject } from '../../hooks/useProject';
import { type Node, type Edge } from 'reactflow';

interface ProjectToolbarProps {
  onProjectLoad?: (projectId: string) => void;
  onSaveProject?: (metadata: { name: string; description?: string; id?: string }) => Promise<string>;
  currentProjectName?: string;
  nodes?: Node[];
  edges?: Edge[];
  onShowProjectList?: () => void;
}

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({ 
  onProjectLoad,
  onSaveProject,
  currentProjectName,
  nodes = [],
  edges = [],
  onShowProjectList
}) => {
  const {
    saveProject,
    createNewProject,
    exportProject,
    importProject,
    currentProject,
    isLoading,
    error,
    clearError
  } = useProject();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('请输入项目名称');
      return;
    }

    try {
      if (onSaveProject) {
        await onSaveProject({
          name: projectName,
          description: projectDescription,
          id: currentProject?.metadata.id
        });
      } else {
        await saveProject(nodes, edges, {
          name: projectName,
          description: projectDescription,
          id: currentProject?.metadata.id
        });
      }
      
      setShowSaveDialog(false);
      setProjectName('');
      setProjectDescription('');
      alert('项目保存成功！');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewProject = async () => {
    if (!projectName.trim()) {
      alert('请输入项目名称');
      return;
    }

    try {
      const projectId = await createNewProject(projectName, projectDescription);
      setShowNewProjectDialog(false);
      setProjectName('');
      setProjectDescription('');
      
      if (onProjectLoad) {
        onProjectLoad(projectId);
      }
      
      alert('新项目创建成功！');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const projectId = await importProject(file);
        
        if (onProjectLoad) {
          onProjectLoad(projectId);
        }
        
        alert('项目导入成功！');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportProject = async () => {
    if (currentProject) {
      try {
        await exportProject(currentProject.metadata.id);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('请先保存项目');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentProjectName || currentProject?.metadata.name || '未命名项目'}
          </h2>
          {isLoading && <span className="text-sm text-blue-600">加载中...</span>}
          {currentProject && (
            <span className="text-sm text-gray-500">
              (最后保存: {new Date(currentProject.metadata.updatedAt).toLocaleString()})
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onShowProjectList && (
            <button
              onClick={onShowProjectList}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              项目管理
            </button>
          )}
          
          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            disabled={isLoading}
          >
            新建项目
          </button>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            disabled={isLoading}
          >
            保存项目
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            disabled={isLoading}
          >
            导入项目
          </button>
          
          <button
            onClick={handleExportProject}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            disabled={isLoading || !currentProject}
          >
            导出项目
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          错误: {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportProject}
        accept=".json,.novel-flow.json"
        className="hidden"
      />

      {/* 保存项目对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">保存项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目描述
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="输入项目描述（可选）"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveProject}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setProjectName('');
                  setProjectDescription('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">创建新项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目描述
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="输入项目描述（可选）"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateNewProject}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? '创建中...' : '创建'}
              </button>
              <button
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setProjectName('');
                  setProjectDescription('');
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
  );
};