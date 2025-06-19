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
    deleteMultipleProjects, // 导入批量删除函数
    exportProject,
    duplicateProject,
    isLoading,
    error
  } = useProject();

  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // 现在 projectToDelete 可以是单个项目 ID 或一个 ID 数组
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

  // 处理单个项目删除
  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  };
  
  // 处理批量删除
  const handleDeleteSelectedProjects = () => {
    // 将 projectToDelete 清空，这样 confirmDelete 就知道是批量删除
    setProjectToDelete(null);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    // 删除单个项目
    if (projectToDelete) {
      await deleteProject(projectToDelete);
    } 
    // 批量删除
    else if (selectedProjects.size > 0) {
      await deleteMultipleProjects(Array.from(selectedProjects));
      setSelectedProjects(new Set()); // 清空选择
    }
    // 关闭对话框并重置状态
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      await duplicateProject(projectId);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allProjectIds = new Set(projectList.map(p => p.id));
      setSelectedProjects(allProjectIds);
    } else {
      setSelectedProjects(new Set());
    }
  };

  const areAllSelected = projectList.length > 0 && selectedProjects.size === projectList.length;

  if (!isOpen) return null;
  
  const getProjectName = (projectId: string) => {
      const project = projectList.find(p => p.id === projectId);
      return project ? project.name : '';
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ... (header and toolbar) */}
        <div className={styles.header}>
          <h2 className={styles.title}>项目管理</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.toolbar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="checkbox"
                checked={areAllSelected}
                onChange={handleSelectAll}
                title={areAllSelected ? "全不选" : "全选"}
              />
              <span>共 {projectList.length} 个项目</span>
              {selectedProjects.size > 0 && (
                <span>(已选 {selectedProjects.size})</span>
              )}
            </div>
            <div>
              {selectedProjects.size > 0 && (
                <button 
                  onClick={handleDeleteSelectedProjects} 
                  style={{ background: '#b91c1c', color: 'white', marginRight: '1rem' }}
                >
                  删除选中
                </button>
              )}
              <button onClick={refreshProjectList} disabled={isLoading}>
                {isLoading ? '刷新中...' : '刷新'}
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.content}>
          {/* ... (error, loading, project list rendering) */}
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
            <div className={styles.modal} style={{ height: 'auto', width: '400px', zIndex: 1100 }}>
              <div className={styles.header}>
                <h3 className={styles.title}>确认删除</h3>
              </div>
              <div className={styles.content} style={{ padding: '1.5rem' }}>
                <p>
                  {projectToDelete
                    ? `确定要删除项目 "${getProjectName(projectToDelete)} "吗？`
                    : `确定要删除选中的 ${selectedProjects.size} 个项目吗？`}
                  <br />
                  此操作无法撤销。
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setShowDeleteDialog(false)}>取消</button>
                  <button onClick={confirmDelete} style={{ background: '#b91c1c', color: 'white' }}>确认删除</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};