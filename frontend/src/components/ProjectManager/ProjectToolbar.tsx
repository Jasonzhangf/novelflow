import React, { useState, useRef } from 'react';
import { useProject } from '../../hooks/useProject';
import { ProjectFileSelector } from './ProjectFileSelector';
import { NewProjectDialog } from './NewProjectDialog';
import styles from './ProjectToolbar.module.css';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNewProject = async (name: string, description: string) => {
    try {
      const projectId = await createNewProject(name, description);
      if (onProjectLoad) {
        onProjectLoad(projectId);
      }
      alert('新项目创建成功！');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleImportProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json') && !file.name.endsWith('.novel-flow.json')) {
        alert('请选择有效的项目文件 (.json 或 .novel-flow.json)');
        return;
      }
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
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.title}>
          {currentProjectName || currentProject?.metadata.name || '未命名项目'}
        </h2>
        {isLoading && <span className={styles.metaText}>加载中...</span>}
        {currentProject && (
          <span className={styles.metaText}>
            (最后保存: {new Date(currentProject.metadata.updatedAt).toLocaleString()})
          </span>
        )}
      </div>
      
      <div className={styles.section}>
        {onShowProjectList && (
          <button onClick={onShowProjectList} className={styles.button}>项目管理</button>
        )}
        <button onClick={() => setShowFileSelector(true)} disabled={isLoading} className={styles.button}>
          打开项目
        </button>
        <button onClick={() => setShowNewProjectDialog(true)} disabled={isLoading} className={styles.button}>
          新建项目
        </button>
        <button
          onClick={async () => {
            try {
              const metadata = {
                name: currentProject?.metadata.name || '未命名项目',
                description: currentProject?.metadata.description,
                id: currentProject?.metadata.id
              };
              if (onSaveProject) {
                await onSaveProject(metadata);
              } else {
                await saveProject(nodes, edges, metadata);
              }
              alert('项目保存成功！');
            } catch (err) {
              console.error(err);
              alert('保存项目失败');
            }
          }}
          disabled={isLoading}
          className={styles.button}
        >
          保存项目
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className={styles.button}>
          导入项目
        </button>
        <button onClick={handleExportProject} disabled={isLoading || !currentProject} className={styles.button}>
          导出项目
        </button>
      </div>

      {error && (
        <div className={styles.errorBar}>
          <span>{error}</span>
          <button onClick={clearError} className={styles.button}>✕</button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportProject}
        accept=".json,.novel-flow.json"
        style={{ display: 'none' }}
      />

      {showNewProjectDialog && (
        <NewProjectDialog
          onClose={() => setShowNewProjectDialog(false)}
          onCreate={handleCreateNewProject}
        />
      )}

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
