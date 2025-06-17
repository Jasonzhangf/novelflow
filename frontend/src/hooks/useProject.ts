import { useState, useCallback } from 'react';
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

  // 刷新项目列表
  const refreshProjectList = useCallback(async () => {
    try {
      const projects = await projectService.getProjectList();
      setProjectList(projects);
    } catch (err) {
      setError('获取项目列表失败');
      console.error(err);
    }
  }, [projectService]);

  // 保存项目
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

      // 更新当前项目
      const savedProject = await projectService.loadProject(projectId);
      setCurrentProject(savedProject);

      // 刷新项目列表
      await refreshProjectList();

      return projectId;
    } catch (err: any) {
      setError(err.message || '保存项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, refreshProjectList]);

  // 加载项目
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

  // 创建新项目
  const createNewProject = useCallback(async (
    name: string,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // 使用完整的初始节点布局
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

  // 删除项目
  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        // 如果删除的是当前项目，清除当前项目
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

  // 导出项目
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

  // 导入项目
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

  // 复制项目
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

  // 获取项目文件列表
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
    // 状态
    projectList,
    currentProject,
    isLoading,
    error,

    // 方法
    refreshProjectList,
    saveProject,
    loadProject,
    createNewProject,
    deleteProject,
    exportProject,
    importProject,
    duplicateProject,
    getProjectFiles,

    // 清除错误
    clearError: () => setError(null),
  };
};