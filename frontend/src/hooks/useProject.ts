import { useState, useCallback, useEffect } from 'react';
import { type Node, type Edge } from 'reactflow';
import { ApiProjectService } from '../services/apiProjectService';
import * as ProjectTypes from '../types/project';
import { getInitialNodes, getInitialEdges } from '../utils/initialLayout';

export const useProject = () => {
  const [projectList, setProjectList] = useState<ProjectTypes.ProjectSummary[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectTypes.ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectService = ApiProjectService.getInstance();

  const refreshProjectList = useCallback(async () => {
    try {
      const projects = await projectService.getProjectList();
      setProjectList(projects);
    } catch (err) {
      setError('获取项目列表失败');
      console.error(err);
    }
  }, [projectService]);

  useEffect(() => {
    refreshProjectList();
  }, [refreshProjectList]);

  const saveProject = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    metadata: Partial<ProjectTypes.ProjectMetadata>,
    viewport?: { x: number; y: number; zoom: number }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectId = await projectService.saveProject(nodes, edges, metadata, viewport);
      const savedProject = await projectService.loadProject(projectId);
      setCurrentProject(savedProject);
      await refreshProjectList();
      return projectId;
    } catch (err: any) {
      setError(err.message || '保存项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, refreshProjectList]);

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await projectService.loadProject(projectId);
      if (project) {
        setCurrentProject(project);
        return project;
      } else {
        throw new Error('项目不存在');
      }
    } catch (err: any) {
      setError(err.message || '加载项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService]);

  const createNewProject = useCallback(async (
    name: string,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const initialNodes: Node[] = getInitialNodes();
      const initialEdges: Edge[] = getInitialEdges();
      const projectId = await saveProject(
        initialNodes,
        initialEdges,
        { name, description }
      );
      return projectId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建项目失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        if (currentProject?.metadata.id === projectId) {
          setCurrentProject(null);
        }
        await refreshProjectList();
        return true;
      } else {
        throw new Error('删除项目失败');
      }
    } catch (err: any) {
      setError(err.message || '删除项目失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, currentProject, refreshProjectList]);
  
  const deleteMultipleProjects = useCallback(async (projectIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // 等待所有删除操作完成
      await Promise.all(projectIds.map(id => projectService.deleteProject(id)));
      
      // 检查当前项目是否在被删除的列表中
      if (currentProject && projectIds.includes(currentProject.metadata.id)) {
        setCurrentProject(null);
      }
      
      await refreshProjectList();
    } catch (err: any) {
      setError(err.message || '批量删除项目失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectService, currentProject, refreshProjectList]);

  const exportProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.exportProject(projectId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出项目失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService]);

  const importProject = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectId = await projectService.importProject(file);
      refreshProjectList();
      return projectId;
    } catch (err: any) {
      setError(err.message || '导入项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, refreshProjectList]);

  const duplicateProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProjectId = await projectService.duplicateProject(projectId);
      if (newProjectId) {
        await refreshProjectList();
        return newProjectId;
      } else {
        throw new Error('复制项目失败');
      }
    } catch (err: any) {
      setError(err.message || '复制项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, refreshProjectList]);

  const getProjectFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await projectService.getProjectFiles();
      return files;
    } catch (err: any) {
      setError(err.message || '获取项目文件列表失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService]);

  return {
    projectList,
    currentProject,
    isLoading,
    error,
    refreshProjectList,
    saveProject,
    loadProject,
    createNewProject,
    deleteProject,
    deleteMultipleProjects, // 导出新函数
    exportProject,
    importProject,
    duplicateProject,
    getProjectFiles,
    clearError: () => setError(null),
  };
};
