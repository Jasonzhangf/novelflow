import React, { useEffect, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import * as ProjectTypes from '../../types/project';
import styles from './ProjectList.module.css';

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
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className={styles.header}>
          <h2 className={styles.title}>项目管理</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>共 {projectList.length} 个项目</span>
            <button onClick={refreshProjectList} disabled={isLoading}>
              {isLoading ? '刷新中...' : '刷新'}
            </button>
          </div>
          {selectedProjects.size > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <span>已选择 {selectedProjects.size} 个</span>
            </div>
          )}
        </div>

        {/* 项目列表 */}
        <div className={styles.content}>
          {error && (
            <div className="error-message">{error}</div>
          )}

          {isLoading ? (
            <div>加载中...</div>
          ) : projectList.length === 0 ? (
            <div>暂无项目</div>
          ) : (
            <div>
              {projectList.map((project: ProjectTypes.ProjectSummary) => (
                <div
                  key={project.id}
                  className={`${styles.projectItem} ${selectedProjects.has(project.id) ? styles.selected : ''}`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className={styles.projectHeader}>
                    <h3 className={styles.projectName}>{project.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {project.description && (
                    <p className={styles.projectMeta}>{project.description}</p>
                  )}

                  <div className={styles.projectMeta}>
                    <div>节点: {project.nodeCount} | 连接: {project.edgeCount}</div>
                    <div>创建: {formatDate(project.createdAt)}</div>
                    <div>更新: {formatDate(project.updatedAt)}</div>
                  </div>

                  <div className={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onProjectSelect(project.id)}>打开</button>
                    <button onClick={() => handleDuplicateProject(project.id)}>复制</button>
                    <button onClick={() => handleExportProject(project.id)}>导出</button>
                    <button onClick={() => handleDeleteProject(project.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 删除确认对话框 */}
        {showDeleteDialog && (
          <div className={styles.backdrop}>
            <div className={styles.modal} style={{ height: 'auto', width: '400px' }}>
              <div className={styles.header}>
                <h3 className={styles.title}>确认删除</h3>
              </div>
              <div className={styles.content} style={{ padding: '1.5rem' }}>
                <p>确定要删除这个项目吗？此操作无法撤销。</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setShowDeleteDialog(false)}>取消</button>
                  <button onClick={confirmDelete} style={{ background: '#b91c1c', color: 'white' }}>删除</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
