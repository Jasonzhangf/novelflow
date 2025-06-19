import React, { useState, useRef } from 'react';
import { useProject } from '../../hooks/useProject';
import { ProjectFileSelector } from './ProjectFileSelector';
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

  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


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
      // 验证文件类型
      if (!file.name.endsWith('.json') && !file.name.endsWith('.novel-flow.json')) {
        alert('请选择有效的项目文件 (.json 或 .novel-flow.json)');
        return;
      }

      // 验证文件大小 (最大10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('文件太大，请选择小于10MB的文件');
        return;
      }

      try {
        const projectId = await importProject(file);
        
        if (onProjectLoad) {
          onProjectLoad(projectId);
        }
        
        alert('项目导入成功！已切换到导入的项目。');
      } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || '导入项目失败';
        alert(`导入失败：${errorMessage}`);
      }
      
      // 清空文件输入，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    <div className="bg-dark-surface border-b border-dark-border px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-dark-text-primary">
            {currentProjectName || currentProject?.metadata.name || '未命名项目'}
          </h2>
          {isLoading && <span className="text-sm text-dark-accent">加载中...</span>}
          {currentProject && (
            <span className="text-sm text-dark-text-secondary">
              (最后保存: {new Date(currentProject.metadata.updatedAt).toLocaleString()})
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onShowProjectList && (
            <button
              onClick={onShowProjectList}
              className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            >
              项目管理
            </button>
          )}
          
          <button
            onClick={() => setShowFileSelector(true)}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            disabled={isLoading}
          >
            打开项目
          </button>

          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            disabled={isLoading}
          >
            新建项目
          </button>
          
          <button
            onClick={async () => {
              try {
                if (onSaveProject) {
                  await onSaveProject({
                    name: currentProject?.metadata.name || '未命名项目',
                    description: currentProject?.metadata.description,
                    id: currentProject?.metadata.id
                  });
                } else {
                  await saveProject(nodes, edges, {
                    name: currentProject?.metadata.name || '未命名项目',
                    description: currentProject?.metadata.description,
                    id: currentProject?.metadata.id
                  });
                }
                alert('项目保存成功！');
              } catch (err) {
                console.error(err);
                alert('保存项目失败');
              }
            }}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            disabled={isLoading}
          >
            保存项目
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            disabled={isLoading}
          >
            导入项目
          </button>
          
          <button
            onClick={handleExportProject}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            disabled={isLoading || !currentProject}
          >
            导出项目
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-800 border border-red-600 rounded text-white text-xs">
          <button onClick={clearError} className="float-right font-bold">X</button>
          {error}
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


      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-dark-surface p-6 rounded-lg shadow-2xl border border-dark-border w-96">
            <h3 className="text-lg font-semibold text-dark-text-primary mb-4">创建新项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
                  placeholder="给你的项目起个名字"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">
                  项目描述 (可选)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
                  placeholder="简单描述一下项目内容"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="px-4 py-2 bg-dark-input text-dark-text-primary rounded hover:bg-dark-hover border border-dark-border"
              >
                取消
              </button>
              <button
                onClick={handleCreateNewProject}
                className="px-4 py-2 bg-dark-accent text-dark-text-primary rounded hover:opacity-90 border border-dark-border"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 项目文件选择器 */}
      {showFileSelector && (
      <ProjectFileSelector
        isOpen={showFileSelector}
        onClose={() => setShowFileSelector(false)}
        onProjectSelect={(projectId) => {
          if (onProjectLoad) {
            onProjectLoad(projectId);
          }
            setShowFileSelector(false);
        }}
      />
      )}
    </div>
  );
};