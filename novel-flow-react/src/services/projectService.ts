import * as ProjectTypes from '../types/project';
import { type Node, type Edge } from 'reactflow';

const STORAGE_KEY = 'novel-flow-projects';
const CURRENT_PROJECT_KEY = 'novel-flow-current-project';

export class ProjectService {
  private static instance: ProjectService;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // 获取所有项目列表
  public getProjectList(): ProjectTypes.ProjectSummary[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const projects: Record<string, ProjectTypes.ProjectData> = JSON.parse(stored);
      return Object.values(projects).map(project => ({
        id: project.metadata.id,
        name: project.metadata.name,
        description: project.metadata.description,
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.updatedAt,
        nodeCount: project.flowData.nodes.length,
        edgeCount: project.flowData.edges.length,
      }));
    } catch (error) {
      console.error('Failed to get project list:', error);
      return [];
    }
  }

  // 保存项目
  public saveProject(
    nodes: Node[],
    edges: Edge[],
    metadata: Partial<ProjectTypes.ProjectMetadata>,
    viewport?: { x: number; y: number; zoom: number }
  ): string {
    try {
      const now = new Date().toISOString();
      const projectId = metadata.id || this.generateId();

      const projectData: ProjectTypes.ProjectData = {
        metadata: {
          id: projectId,
          name: metadata.name || '未命名项目',
          description: metadata.description,
          createdAt: metadata.createdAt || now,
          updatedAt: now,
          version: '1.0.0',
          author: metadata.author,
        },
        flowData: {
          nodes: nodes.map(node => ({
            ...node,
            // 清理可能存在的不必要属性
            selected: false,
            dragging: false,
          })),
          edges: edges.map(edge => ({
            ...edge,
            selected: false,
          })),
          viewport,
        },
        settings: {
          gridSize: 20,
          snapToGrid: false,
          showGrid: true,
        },
      };

      // 获取现有项目
      const stored = localStorage.getItem(STORAGE_KEY);
      const projects: Record<string, ProjectTypes.ProjectData> = stored ? JSON.parse(stored) : {};

      // 更新项目
      projects[projectId] = projectData;

      // 保存到localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        // Set current project only after successful save
        localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          throw new Error('保存项目失败：本地存储空间不足。请清理浏览器数据或删除一些旧项目。');
        } else {
          throw e; // Re-throw other errors
        }
      }

      return projectId;
    } catch (error: any) {
      console.error('Failed to save project:', error);
      throw new Error('保存项目失败');
    }
  }

  // 加载项目
  public loadProject(projectId: string): ProjectTypes.ProjectData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const projects: Record<string, ProjectTypes.ProjectData> = JSON.parse(stored);
      const project = projects[projectId];

      if (project) {
        localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
        return project;
      }

      return null;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  // 删除项目
  public deleteProject(projectId: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const projects: Record<string, ProjectTypes.ProjectData> = JSON.parse(stored);

      if (projects[projectId]) {
        delete projects[projectId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

        // 如果删除的是当前项目，清除当前项目标记
        const currentProject = localStorage.getItem(CURRENT_PROJECT_KEY);
        if (currentProject === projectId) {
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  // 导出项目到文件
  public exportProject(projectId: string): void {
    const project = this.loadProject(projectId);
    if (!project) {
      throw new Error('项目不存在');
    }

    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.metadata.name}.novel-flow.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 从文件导入项目
  public async importProject(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData: ProjectTypes.ProjectData = JSON.parse(e.target?.result as string);

          // 验证项目数据格式
          if (!this.validateProjectData(projectData)) {
            reject(new Error('无效的项目文件格式'));
            return;
          }

          // 生成新的项目ID以避免冲突
          const newId = this.generateId();
          projectData.metadata.id = newId;
          projectData.metadata.updatedAt = new Date().toISOString();

          // 保存项目
          const stored = localStorage.getItem(STORAGE_KEY);
          const projects: Record<string, ProjectTypes.ProjectData> = stored ? JSON.parse(stored) : {};
          projects[newId] = projectData;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

          resolve(newId);
        } catch (error: any) {
          if (error instanceof SyntaxError) {
            reject(new Error('项目文件不是有效的 JSON 格式'));
          } else if (error.message === '无效的项目文件格式') {
             reject(error); // Re-reject the specific validation error
          } else {
            reject(new Error('处理项目文件时发生未知错误'));
          }
        }
      };
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        reject(new Error('读取项目文件失败'));
      };
      reader.readAsText(file);
    });
  }

  // 获取当前项目ID
  public getCurrentProjectId(): string | null {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  }

  // 复制项目
  public duplicateProject(projectId: string): string | null {
    const project = this.loadProject(projectId);
    if (!project) return null;

    const newId = this.generateId();
    const now = new Date().toISOString();

    const duplicatedProject: ProjectTypes.ProjectData = {
      ...project,
      metadata: {
        ...project.metadata,
        id: newId,
        name: `${project.metadata.name} (副本)`,
        createdAt: now,
        updatedAt: now,
      },
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: Record<string, ProjectTypes.ProjectData> = stored ? JSON.parse(stored) : {};
    projects[newId] = duplicatedProject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

    return newId;
  }

  // 生成唯一ID
  private generateId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 验证项目数据格式
  private validateProjectData(data: any): data is ProjectTypes.ProjectData {
    // Basic structure validation
    if (!data || typeof data !== 'object' || !data.metadata || typeof data.metadata !== 'object' || !data.flowData || typeof data.flowData !== 'object' || !Array.isArray(data.flowData.nodes) || !Array.isArray(data.flowData.edges)) {
      return false;
    }

    // Validate nodes structure
    for (const node of data.flowData.nodes) {
      if (!node || typeof node !== 'object' || typeof node.id !== 'string' || typeof node.type !== 'string' || !node.position || typeof node.position !== 'object' || typeof node.position.x !== 'number' || typeof node.position.y !== 'number' || !node.data || typeof node.data !== 'object') {
        console.error('Validation failed: Invalid node structure', node);
        return false;
      }
    }

    // Validate edges structure
    for (const edge of data.flowData.edges) {
      if (!edge || typeof edge !== 'object' || typeof edge.id !== 'string' || typeof edge.source !== 'string' || typeof edge.target !== 'string') {
         console.error('Validation failed: Invalid edge structure', edge);
        return false;
      }
    }

    return true;
  }
}