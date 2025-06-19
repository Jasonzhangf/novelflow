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

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const projects = await projectService.getProjectList();
        setProjectList(projects);

        if (projects && projects.length > 0) {
          // Backend sorts projects by last updated, so the first one is the most recent.
          const mostRecentProject = await projectService.loadProject(projects[0].id);
          if (mostRecentProject) {
            setCurrentProject(mostRecentProject);
          } else {
            // If loading the specific project fails for some reason, start fresh.
            setCurrentProject({
              metadata: { id: null, name: '未命名项目', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '1.0.0' },
              flowData: { nodes: getInitialNodes(), edges: getInitialEdges(), viewport: { x: 0, y: 0, zoom: 1 } },
            });
          }
        } else {
          // No projects exist on the backend, create a new unsaved project in memory.
          setCurrentProject({
            metadata: { id: null, name: '未命名项目', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '1.0.0' },
            flowData: { nodes: getInitialNodes(), edges: getInitialEdges(), viewport: { x: 0, y: 0, zoom: 1 } },
          });
        }
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setError("无法连接到后端服务。将创建一个新的本地项目。");
        // If the backend is unreachable, create a new unsaved project in memory.
        setCurrentProject({
          metadata: { id: null, name: '未命名项目', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '1.0.0' },
          flowData: { nodes: getInitialNodes(), edges: getInitialEdges(), viewport: { x: 0, y: 0, zoom: 1 } },
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // IMPORTANT: Empty dependency array ensures this runs only ONCE on mount.

  const refreshProjectList = useCallback(async () => {
    try {
      const projects = await projectService.getProjectList();
      setProjectList(projects);
    } catch (err) {
      setError('获取项目列表失败');
      console.error(err);
    }
  }, [projectService]);

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

  const initializeNewProject = useCallback(() => {
    setCurrentProject({
      metadata: {
        id: null,
        name: '未命名项目',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
      flowData: {
        nodes: getInitialNodes(),
        edges: getInitialEdges(),
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });
  }, []);
  
  const createNewProject = useCallback(() => {
    initializeNewProject();
  }, [initializeNewProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        // After deleting, load the most recent project or create a new one
        const projects = await projectService.getProjectList();
        setProjectList(projects);
        if (projects.length > 0) {
          await loadProject(projects[0].id);
        } else {
          initializeNewProject();
        }
      } else {
        throw new Error('删除项目失败');
      }
    } catch (err: any) {
      setError(err.message || '删除项目失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectService, loadProject, initializeNewProject]);
  
  const deleteMultipleProjects = useCallback(async (projectIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(projectIds.map(id => projectService.deleteProject(id)));
      
      const projects = await projectService.getProjectList();
      setProjectList(projects);
      if (projects.length > 0) {
        await loadProject(projects[0].id);
      } else {
        initializeNewProject();
      }
    } catch (err: any) {
      setError(err.message || '批量删除项目失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectService, loadProject, initializeNewProject]);

  const renameProject = useCallback(async (newName: string) => {
    if (!currentProject || !currentProject.metadata.id) {
      setError("请先保存当前项目才能重命名");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { nodes, edges, viewport } = currentProject.flowData;
      const metadata: Partial<ProjectTypes.ProjectMetadata> = { ...currentProject.metadata, name: newName };
      
      await projectService.saveProject(nodes, edges, metadata, viewport);
      
      setCurrentProject(prev => {
        if (!prev) return null;
        const newMeta: ProjectTypes.ProjectMetadata = { ...prev.metadata, id: prev.metadata.id, name: newName };
        return { ...prev, metadata: newMeta };
      });
      await refreshProjectList();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重命名项目失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, currentProject, refreshProjectList]);

  const importProject = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectId = await projectService.importProject(file);
      await refreshProjectList();
      await loadProject(projectId);
      return projectId;
    } catch (err: any) {
      setError(err.message || '导入项目失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectService, refreshProjectList, loadProject]);

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
    deleteMultipleProjects,
    renameProject,
    importProject,
    duplicateProject,
    getProjectFiles,
    clearError: () => setError(null),
  };
};
