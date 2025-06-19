import * as ProjectTypes from '../types/project';
import { type Node, type Edge } from 'reactflow';

const API_BASE_URL = 'http://localhost:8888/api';

export class ApiProjectService {
  private static instance: ApiProjectService;

  public static getInstance(): ApiProjectService {
    if (!ApiProjectService.instance) {
      ApiProjectService.instance = new ApiProjectService();
    }
    return ApiProjectService.instance;
  }

  // 获取所有项目列表
  public async getProjectList(): Promise<ProjectTypes.ProjectSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get project list:', error);
      throw new Error('获取项目列表失败');
    }
  }

  // 保存项目
  public async saveProject(
    nodes: Node[],
    edges: Edge[],
    metadata: Partial<ProjectTypes.ProjectMetadata>,
    viewport?: { x: number; y: number; zoom: number }
  ): Promise<string> {
    try {
      const cleanNodes = nodes.map(node => ({
        ...node,
        selected: false,
        dragging: false,
      }));

      const cleanEdges = edges.map(edge => ({
        ...edge,
        selected: false,
      }));

      const requestBody = {
        nodes: cleanNodes,
        edges: cleanEdges,
        metadata: {
          name: metadata.name || '未命名项目',
          description: metadata.description,
          id: metadata.id,
          author: metadata.author,
        },
        viewport,
      };

      const url = metadata.id 
        ? `${API_BASE_URL}/projects/${metadata.id}` 
        : `${API_BASE_URL}/projects`;
      
      const method = metadata.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.projectId || metadata.id;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('保存项目失败');
    }
  }

  // 加载项目
  public async loadProject(projectId: string): Promise<ProjectTypes.ProjectData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error('加载项目失败');
    }
  }

  // 删除项目
  public async deleteProject(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (response.status === 404) {
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('删除项目失败');
    }
  }

  // 批量删除项目
  public async deleteMultipleProjects(projectIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete multiple projects:', error);
      throw new Error('批量删除项目失败');
    }
  }

  // 导出项目到后端文件系统
  public async exportProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/export`, {
        method: 'POST',
      });

      if (response.status === 404) {
        throw new Error('项目不存在');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`项目已导出到服务器: ${result.fileName}`);
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('导出项目失败');
    }
  }

  // 获取项目文件列表
  public async getProjectFiles(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/files`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get project files:', error);
      throw new Error('获取项目文件列表失败');
    }
  }

  // 复制项目
  public async duplicateProject(projectId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/duplicate`, {
        method: 'POST',
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.projectId;
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      throw new Error('复制项目失败');
    }
  }

  // 从文件导入项目
  public async importProject(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const projectData: ProjectTypes.ProjectData = JSON.parse(e.target?.result as string);

          // 验证项目数据格式
          if (!this.validateProjectData(projectData)) {
            reject(new Error('无效的项目文件格式'));
            return;
          }

          // 保存为新项目（不包含原ID）
          const projectId = await this.saveProject(
            projectData.flowData.nodes,
            projectData.flowData.edges,
            {
              name: `${projectData.metadata.name} (导入)`,
              description: projectData.metadata.description,
              author: projectData.metadata.author,
            },
            projectData.flowData.viewport
          );

          resolve(projectId);
        } catch (error: any) {
          if (error instanceof SyntaxError) {
            reject(new Error('项目文件不是有效的 JSON 格式'));
          } else if (error.message === '无效的项目文件格式') {
            reject(error);
          } else {
            reject(new Error('处理项目文件时发生未知错误'));
          }
        }
      };
      reader.onerror = () => {
        reject(new Error('读取项目文件失败'));
      };
      reader.readAsText(file);
    });
  }

  // 检查API健康状态
  public async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 验证项目数据格式
  private validateProjectData(data: any): data is ProjectTypes.ProjectData {
    if (!data || typeof data !== 'object' || 
        !data.metadata || typeof data.metadata !== 'object' || 
        !data.flowData || typeof data.flowData !== 'object' || 
        !Array.isArray(data.flowData.nodes) || 
        !Array.isArray(data.flowData.edges)) {
      return false;
    }

    // 验证节点结构
    for (const node of data.flowData.nodes) {
      if (!node || typeof node !== 'object' || 
          typeof node.id !== 'string' || 
          typeof node.type !== 'string' || 
          !node.position || typeof node.position !== 'object' || 
          typeof node.position.x !== 'number' || 
          typeof node.position.y !== 'number' || 
          !node.data || typeof node.data !== 'object') {
        return false;
      }
    }

    // 验证边结构
    for (const edge of data.flowData.edges) {
      if (!edge || typeof edge !== 'object' || 
          typeof edge.id !== 'string' || 
          typeof edge.source !== 'string' || 
          typeof edge.target !== 'string') {
        return false;
      }
    }

    return true;
  }
}