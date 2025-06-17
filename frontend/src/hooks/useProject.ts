import { useState, useCallback } from 'react';
import { type Node, type Edge } from 'reactflow';
import { ProjectService } from '../services/projectService';
import * as ProjectTypes from '../types/project';

export const useProject = () => {
  const [projectList, setProjectList] = useState<ProjectTypes.ProjectSummary[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectTypes.ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectService = ProjectService.getInstance();

  // 刷新项目列表
  const refreshProjectList = useCallback(() => {
    try {
      const projects = projectService.getProjectList();
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
      const projectId = projectService.saveProject(nodes, edges, metadata, viewport);

      // 更新当前项目
      const savedProject = projectService.loadProject(projectId);
      setCurrentProject(savedProject);

      // 刷新项目列表
      refreshProjectList();

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
      const project = projectService.loadProject(projectId);
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
      // 创建空的初始节点
      const initialNodes: Node[] = [
        {
          id: '1',
          type: 'scene',
          position: { x: 250, y: 100 },
          data: {
            label: '场景节点',
            sceneName: '序章',
            sceneData: {}
          },
        },
      ];
      const initialEdges: Edge[] = [];

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
      const success = projectService.deleteProject(projectId);
      if (success) {
        // 如果删除的是当前项目，清除当前项目
        if (currentProject?.metadata.id === projectId) {
          setCurrentProject(null);
        }
        refreshProjectList();
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
      projectService.exportProject(projectId);
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
      const newProjectId = projectService.duplicateProject(projectId);
      if (newProjectId) {
        refreshProjectList();
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

    // 清除错误
    clearError: () => setError(null),
  };
};